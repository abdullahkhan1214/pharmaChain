var x       =require("express"),
app         =x(),
mongoose    =require("mongoose"),
bodyParser  =require("body-parser"),
methodOverride=require("method-override");
    
app.use(x.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost/pharmachain",{useFindAndModify:false});

//database schema definition for contract
var contract_schema=new mongoose.Schema({
    contractID:String,
    medicinesID:[String],
    quantity:[String],
    status:String,
    completionStatus:String,
    seller:String,
    buyer:String
});


//database schema definition for Box
var box_schema=new mongoose.Schema({
    shipmentID:String,
    trackingCode:String,
    originAddress:String,
    destinationAddress:String,
    currentAddress:String,
    status:String,
    parentContract:String,
    previousBoxID:String,
    medicinesContained:[String],
    quantityProvided:[String]
    
});


//database schema definition for Shipment
var shipment_schema=new mongoose.Schema({
    shipmentID:String,
    boxIDArray:[String],
    routeName:String,
    reachedDestination:String,
    owner:String
});


//database schema definition for medicines 
 var medicine_schema=new mongoose.Schema({
    medicineID:String,
    medicineName:String,
    manufactureDate:{type:Date, default: Date.now},
    expiryDate:{type:Date, default: Date.now},
    manufacturer:String,
    owner:String,
});  
  
var contract=mongoose.model("PharmaContract",contract_schema);
var medicine=mongoose.model("PharmaMedicine",medicine_schema);
var shipment=mongoose.model("PharmaShipment",shipment_schema);
var box=mongoose.model("PharmaBox",box_schema);

app.get("/",function(req,res){
    res.render("index");
});
app.get("/index",function(req,res){
    res.render("index");
});

app.post("/index/m", function(req,res){
    var mID=req.body.medicineID;
    var mn=req.body.medicineName;
    var mDate=req.body.manufactureDate;
    var eDate=req.body.expiryDate;
    var manu=req.body.manufacturer;
    var own=req.body.owner;
      
    medicine.create({
       medicineID:mID, 
       medicineName:mn,
       manufactureDate:mDate,
       expiryDate:eDate,
       manufacturer:manu,
       owner:own
    }, 
        function(err,Medicine){
        if(err) 
            console.log("Something went wrong");
        else
        {
            console.log("We Added A New Medicine"+ Medicine);
        }
    });
     res.redirect("/index");
});
    
    
    app.post("/index/c", function(req,res){
    var conID=req.body.contractID;
    var st=req.body.status;
    var completionSt=req.body.completionStatus;
    var sel=req.body.seller;
    var b=req.body.buyer;
      var mIDArray = [];
        for (var i = 0; i < req.body.medicinesID.length; i++) {
        mIDArray.push(req.body.medicinesID[i]);
        }
    
    var q = [];
        for (var i = 0; i < req.body.quantity.length; i++) {
        q.push(req.body.quantity[i]);
        }
    
    
    contract.create({
       contractID:conID, 
       medicinesID:mIDArray,
       quantity:q,
       status:st,
       completionStatus:completionSt,
       seller:sel,
       buyer:b
    }, 
        function(err,Contract){
        if(err) 
            console.log("Something went wrong"+err);
        else
        {
            console.log("We Added A New Contract"+ Contract);
        }
    });
     res.redirect("/index");
});


app.post("/index/b", function(req,res){
    var shipID=req.body.shipmentID;
    var trackCode=req.body.trackingCode;
    var oriAdd=req.body.originAddress;
    var desAdd=req.body.destinationAddress;
    var curAdd=req.body.currentAddress;
    var st=req.body.status;
    var pContract=req.body.parentContract;
    var prevBoxID=req.body.previousBoxID;
    
    var medContained = [];
        for (var i = 0; i < req.body.medicinesContained.length; i++) {
        medContained.push(req.body.medicinesContained[i]);
        }
    
    var qProvided = [];
        for (var i = 0; i < req.body.quantityProvided.length; i++) {
        qProvided.push(req.body.quantityProvided[i]);
        }
  
    box.create({
       shipmentID:shipID, 
       trackingCode:trackCode,
       originAddress:oriAdd,
       destinationAddress:desAdd,
       currentAddress:curAdd,
       status:st,
       parentContract:pContract,
       previousBoxID:prevBoxID,
       medicinesContained:medContained,
       quantityProvided:qProvided
    }, 
        function(err,Box){
        if(err) 
            console.log("Something went wrong"+err);
        else
        {
            console.log("We Added A New Box"+ Box);
        }
    });
     res.redirect("/index");
});


app.post("/index/s", function(req,res){
    var shipID=req.body.shipmentID;
    var trackCode=req.body.trackingCode;
    var route=req.body.routeName;
    var reachDest=req.body.reachedDestination;
    var own=req.body.owner;
  
    
    
    var boxIDs = [];
        for (var i = 0; i < req.body.boxIDArray.length; i++) {
        boxIDs.push(req.body.boxIDArray[i]);
        }
   
  
    shipment.create({
       shipmentID:shipID, 
       boxIDArray:boxIDs,
       routeName:route,
       reachedDestination:reachDest,
       owner:own
       
   
    }, 
        function(err,Shipment){
        if(err) 
            console.log("Something went wrong"+err);
        else
        {
            console.log("We Added A New Shipment"+ Shipment);
        }
    });
     res.redirect("/index");
});

app.get("/medicines/new" , function(req,res){
   res.render("AddMedicine.ejs");
});
app.get("/boxes/new" , function(req,res){
   res.render("AddBox.ejs");
});
app.get("/shipments/new" , function(req,res){
   res.render("AddShipment.ejs");
});


app.get("/contracts/new" , function(req,res){
   res.render("AddContract.ejs");
});


//function to display a list of all Medicines
app.get("/medicines",function(req, res){
    medicine.find({},function(err,medicines){
    if(err) {
        console.log("An error has occured!!");
        console.log(err);
        }
    else
        res.render("showMedicines",{medicines:medicines});
    })
});

app.get("/medicines/:id/edit",function(req,res){
    medicine.findById(req.params.id, function(err,foundMedicine){
        if(err) res.redirect("/medicines");
        else res.render("updateMedicine",{medicine:foundMedicine});
    });
    
});

app.put("/medicine/:id",function(req,res){
    var mID=req.body.medicineID;
    var mn=req.body.medicineName;
    var mDate=req.body.manufactureDate;
    var eDate=req.body.expiryDate;
    var manu=req.body.manufacturer;
    var own=req.body.owner;
      
    medicine.findByIdAndUpdate(req.params.id,{
       medicineID:mID, 
       medicineName:mn,
       manufactureDate:mDate,
       expiryDate:eDate,
       manufacturer:manu,
       owner:own
    }, 
        function(err,Medicine){
        if(err) 
            console.log("Something went wrong");
        else
        {
            console.log("We Updated A Medicine"+ Medicine);
        }
        
    });
     res.redirect("/index");
});
    
    //function to display a list of all Contracts
app.get("/contracts/show",function(req, res){
    contract.find({},function(err,contracts){
    if(err) {
        console.log("An error has occured!!");
        console.log(err);
        }
    else
        res.render("showContracts",{contracts:contracts});
    })
});

app.get("/contracts/:id/edit",function(req,res){
    contract.findById(req.params.id, function(err,foundCountract){
        if(err) res.redirect("/contracts/show");
        else res.render("updateContract",{contract:foundCountract});
    });
    
});

app.put("/contracts/:id",function(req,res){
   var conID=req.body.contractID;
    var st=req.body.status;
    var completionSt=req.body.completionStatus;
    var sel=req.body.seller;
    var b=req.body.buyer;
      var mIDArray = [];
        for (var i = 0; i < req.body.medicinesID.length; i++) {
        mIDArray.push(req.body.medicinesID[i]);
        }
    
    var q = [];
        for (var i = 0; i < req.body.quantity.length; i++) {
        q.push(req.body.quantity[i]);
        }
    
    contract.findByIdAndUpdate(req.params.id,{
      contractID:conID, 
       medicinesID:mIDArray,
       quantity:q,
       status:st,
       completionStatus:completionSt,
       seller:sel,
       buyer:b
    }, 
        function(err,Contract){
        if(err) 
            console.log("Something went wrong");
        else
        {
            console.log("We Updated A Contract"+ Contract);
        }
        
    });
     res.redirect("/index");
});


//function to display a list of all Boxes
app.get("/boxes/show",function(req, res){
    box.find({},function(err,boxes){
    if(err) {
        console.log("An error has occured!!");
        console.log(err);
        }
    else
        res.render("showBoxes",{boxes:boxes});
    })
});

app.get("/boxes/:id/edit",function(req,res){
    box.findById(req.params.id, function(err,foundBox){
        if(err) res.redirect("/boxes");
        else res.render("updateBox",{box:foundBox});
    });
    
});

app.put("/boxes/:id",function(req,res){
    // var shipID=req.body.shipmentID;
    // var trackCode=req.body.trackingCode;
    // var oriAdd=req.body.originAddress;
    // var desAdd=req.body.destinationAddress;
    var curAdd=req.body.currentAddress;
    var st=req.body.status;
    // var pContract=req.body.parentContract;
    // var prevBoxID=req.body.previousBoxID;
    
    // var medContained = [];
    //     for (var i = 0; i < req.body.medicinesContained.length; i++) {
    //     medContained.push(req.body.medicinesContained[i]);
    //     }
    
    // var qProvided = [];
    //     for (var i = 0; i < req.body.quantityProvided.length; i++) {
    //     qProvided.push(req.body.quantityProvided[i]);
    //     }
  
      
    box.findByIdAndUpdate(req.params.id,{$set:{
    //   shipmentID:shipID, 
    //   trackingCode:trackCode,
    //   originAddress:oriAdd,
    //   destinationAddress:desAdd,
       currentAddress:curAdd,
       status:st }
    //   parentContract:pContract,
    //   previousBoxID:prevBoxID,
    //   medicinesContained:medContained,
    //   quantityProvided:qProvided
    }, 
        function(err,Box){
        if(err) 
            console.log("Something went wrong");
        else
        {
            console.log("We Updated A Box"+ Box);
        }
        
    });
     res.redirect("/index");
});
   
   
   
//function to display a list of all Shipments
app.get("/shipments/show",function(req, res){
    shipment.find({},function(err,shipments){
    if(err) {
        console.log("An error has occured!!");
        console.log(err);
        }
    else
        res.render("showShipments",{shipments:shipments});
    })
});
// Edit route for Shipments
//   app.get("/shipments/:id/edit",function(req,res){
//     shipment.findById(req.params.id, function(err,foundShipment){
//         if(err) res.redirect("/shipments");
//         else res.render("updateShipment",{shipment:foundShipment});
//     });
    
// });

app.get("/shipments/:id/updateStatus",function(req,res){
//   var shipID=req.body.shipmentID;
//     var trackCode=req.body.trackingCode;
//     var route=req.body.routeName;
    // var reachDest=req.body.reachedDestination;
    // var own=req.body.owner;
  
    
    
    // var boxIDs = [];
    //     for (var i = 0; i < req.body.boxIDArray.length; i++) {
    //     boxIDs.push(req.body.boxIDArray[i]);
    //     }
      
    shipment.findByIdAndUpdate(req.params.id,{$set:{
    //   shipmentID:shipID, 
    //   boxIDArray:boxIDs,
    //   routeName:route,
       reachedDestination:"True" }
    //   owner:own
    }, 
        function(err,Box){
        if(err) 
            console.log("Something went wrong");
        else
        {
            console.log("We Updated A Shipment"+ Box);
        }
        
    });
     res.redirect("/index");
}); 

app.get("/shipments/:id/delete", function(req, res){
    shipment.findByIdAndDelete(req.params.id,
     function(err,S){
        if(err) 
            console.log("Something went wrong");
        else
        {
            console.log("We Deleted A Shipment"+ S);
        }
     });
     res.render("/index");
});

app.listen(process.env.PORT, process.env.ID, function(){
    console.log("The Web Server Has Started........");
});