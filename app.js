const dotenv =require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

dotenv.config({path :"./config.env"});
const DB = process.env.DATABASE;
const PORT = process.env.PORT;
const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(DB,{useNewUrlParser:true});
}

const ItemsSchema = {
  name: String
};

const Item = mongoose.model("Item", ItemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to Add a new Item"
});

const item3 = new Item({
  name:"<--hit this to delete an item"
});

const defaulItems =[item1, item2, item3];

const listSchema={
  name: String,
  items: [ItemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
  Item.find()
  .then((foundItems)=>{
    if(foundItems.length === 0){
      Item.insertMany(defaulItems)
       .then(()=>{
         console.log('successfully saved default items to DB');
       })
       .catch((err)=>{
         console.log(err);
       })
       res.redirect("/")
    }else{
    res.render("list",{ listTitle: "Today", newListItems : foundItems });
  }
})
  .catch((err)=>{
    console.log(err);
  })
  });

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
const item = new Item({
  name: itemName
});
if(listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName})
  .then((foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
  })
}
})

app.post("/delete",function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName =req.body.listName;

   if(listName === "Today"){
     Item.findByIdAndRemove({_id:checkedItemId})
     .then(()=>{
       console.log("successfully removed");
     })
     .catch((err)=>{
       console.log(err);
     })
     res.redirect("/")
  }else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then(()=>{
     res.redirect("/"+ listName)
     })
     .catch((err)=>{
       console.log(err);
     })
}
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
List.findOne({name:customListName})
.then((foundName)=>{
  if(foundName===null){
    const list =new List({
      name: customListName,
      items: defaulItems
    });
    list.save();
    res.redirect("/"+customListName);
  }else{
    res.render("list",{ listTitle: customListName, newListItems : foundName.items });
  }
})

});


app.get("/about", function(req,res){
  res.render("about");
})

app.listen(PORT, function(){

  console.log("server started on PORT ");

});
