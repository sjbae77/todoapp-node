const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

let db;

MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.3fl9jmf.mongodb.net/todoapp?retryWrites=true&w=majority",
  function (err, client) {
    //연결되면 할일
    if (err) return console.log(err);
    db = client.db("todoapp");

    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  }
);

app.get("/pet", function (req, res) {
  res.send("펫용품 쇼핑할 수 있는 페이지입니다.");
});

app.get("/beauty", function (req, res) {
  res.send("뷰티용품 쇼핑할 수 있는 페이지입니다.");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", function (req, res) {
  res.sendFile(__dirname + "/write.html");
});

// 누가 폼에서 /add로 POST요청하면
app.post("/add", function (req, res) {
  res.send("전송완료");

  //DB.counter내의 총개시물갯수를 찾음
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (err, result) {
      console.log(result.totalPost);
      //찾아서 변수에 담아줌
      let totalPost = result.totalPost;

      //DB.post에 새게시물 기록함
      db.collection("post").insertOne(
        { _id: totalPost, title: req.body.title, date: req.body.date },
        function (err, result) {
          console.log("저장완료");

          //counter라는 콜렉션에 있는 totalPost 라는 항목도 1 증가시켜야함 (수정)
          db.collection("counter").updateOne(
            { name: "게시물갯수" },
            //몽고DB내의 연산자 문법
            { $inc: { totalPost: 1 } },
            function (err, result) {
              if (err) return console.log(err);
            }
          );
        }
      );
    }
  );
});

//디비에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
app.get("/list", function (req, res) {
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      console.log(result);
      //{이런이름으로 : 이런데이터를} list.ejs에 꽂아주세요~
      res.render("list.ejs", { posts: result });
    });
});

app.delete("/delete", function (req, res) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  //req.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
  db.collection("post").deleteOne(req.body, function (err, result) {
    console.log("삭제완료");
    //서버는 꼭 뭔가 응답해줘야함!!!
    res.status(200).send({ message: "성공했습니다" });
    // res.status(400).send({ message: "실패했습니다" });
  });
});

//url의 파라미터!
app.get("/detail/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      if (result === null) {
        console.log("없는 게시글입니다.");

        res.status(500).send({ message: "없는 게시글입니다." });
      }
      console.log(result);
      res.render("detail.ejs", { data: result });
    }
  );
});
