const Koa = require("koa");
const { Configuration, OpenAIApi } = require("openai");
const Router = require("koa-router");
const serve = require("koa-static");
const bodyParser = require("koa-bodyparser");
const cors = require('koa2-cors');
const mysql = require("mysql");
var conn = mysql.createConnection({
    host: "localhost",
    user: "user",
    password: "password",
    database:"chatlog",
    port: 3306
});



const app = new Koa();
const router = new Router();

// 初始化 openai 库
const configuration = new Configuration({
    apiKey: 'your_APIKEY',
});
const openai = new OpenAIApi(configuration);

// 使用 koa-bodyparser 插件，对请求数据进行解析
app.use(bodyParser());

var  sql = 'SELECT user_name,message,timestamp FROM chat_logs order by timestamp desc limit 6';
var cmsg;
var context_msg;
conn.connect();

app.use(cors());
async function executeQueryAsync(sql3, params) {
  return new Promise((resolve, reject) => {
    conn.query(sql3, params, (err, result) => {
      if (err) {
        console.log('Error:', err.message);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}








router.get('/api/getChatMessages', async (ctx, next) => {

	conn.query(sql,function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
	
       //console.log('--------------------------SELECT----------------------------');
       //console.log(result);
       //console.log('------------------------------------------------------------\n\n');  
	   cmsg=result;
	});
	//console.log('request');
	ctx.body = cmsg;
});







router.post("/api/generate-image", async (ctx, next) => {
    console.log("POST:generate-image");
	
	const { model, prompt } = ctx.request.body;
	console.log(ctx.request.body);
//    const response = await openai.createImage({
//        model: "image-alpha-001",
//        prompt,
//    });
	var  addSql = 'INSERT INTO chat_logs(user_id, user_name, message, is_user) VALUES(?,?,?,?)';
	var  addUserRespParams = [1, 'user',prompt, true];
	
	conn.query(addSql,addUserRespParams,function (err, result) {
			if(err){
			console.log('[INSERT ERROR] - ',err.message);
			return;
			}        
	
		console.log('--------------------------INSERT_USER----------------------------');
	});

	var sql2="SELECT user_name,message from(SELECT user_name,message,timestamp FROM chat_logs order by timestamp desc limit 6)aa order by timestamp";

	context_msg = await executeQueryAsync(sql2, []);
	var context_msg1=context_msg.map(row => {
        return { role: row.user_name, content: row.message };
      });
	console.log(context_msg1);
	const chat_completion = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: context_msg1,
		max_tokens:100,
	});
	
	
	var  addBOTRespParams = [0, chat_completion.data.choices[0].message.role,chat_completion.data.choices[0].message.content, false];
	conn.query(addSql,addBOTRespParams,function (err, result) {
			if(err){
			console.log('[INSERT ERROR] - ',err.message);
			return;
			}        
	
		console.log('--------------------------INSERT_BOT----------------------------');
	});
	
	

    console.log(chat_completion.data.choices[0].message);

    ctx.body = chat_completion.data.choices[0].message;
});

// 使用 koa-static 插件，处理静态文件
app.use(serve("./public"));

// 将路由绑定到应用上
app.use(router.routes());

// 启动应用
app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});