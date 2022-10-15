const Express = require('express');
const app = Express();
const path = require("path");
const bodyParser = require('body-parser')
const { AssetGroupRepository } = require('./Repositories/AssetGroupRepository.js');
const { AssetGroup } = require('./Models/AssetGroup.js');
const { Asset } = require('./Models/Asset.js');


let Port = 5050;

let assetGroupRepository = new AssetGroupRepository();

let urlEncoder = bodyParser.urlencoded({ extended: false })
app.use("/", Express.static(path.join(__dirname, "../Client/public/")));

app.listen(Port, () => {
    console.log("Server started on port: " + Port)
    Startup();
});

async function Startup() {
    //Temp
    let assetId = 0;
    for (let i = 0; i<11; i++) {
        let assetGroup = new AssetGroup(i, "AssetGroup " + i, "Asset Group Desc " + i);
        if (i == 2) {
            assetGroup = new AssetGroup(i, "KokerPalen", "KokerPalen 1110-4440");
            assetGroup.assetList.push(new Asset("kokerpaal#0", "KokerPaal 1110", 1200, 111, 100, 100, "Asset2/Kokerpaal1110_Front.png", null));
            assetGroup.assetList.push(new Asset("kokerpaal#1", "KokerPaal 2230", 1600, 223, 100, 100, "Asset2/Kokerpaal2230_Front.png", null));
            assetGroup.assetList.push(new Asset("kokerpaal#2", "KokerPaal 3340", 2200, 334, 100, 100, "Asset2/Kokerpaal3340_Front.png", null));
            assetGroup.assetList.push(new Asset("kokerpaal#3", "KokerPaal 4440", 3000, 444, 100, 100, "Asset2/Kokerpaal4440_Front.png", null));
        }
        if (i == 3) {
            assetGroup = new AssetGroup(i, "TestAsset", "TestAsset 4440x200cm");
            assetGroup.assetList.push(new Asset("asset2#0", "TestAsset 4440x200cm", 4000, 444, 200, 200, "Asset2/Kokerpaal1110_Front.png", null));
        }

        for (let j = 0; j<4; j++) {
            if (i != 2 && i != 3) assetGroup.assetList.push(new Asset("Asset#" + assetId, "Asset " + i + "." + j, 400, 200, 120, 100, "Asset1/Asset1_Front.png", null));
            assetId++;
        }
        assetGroupRepository.AssetGroups.push(assetGroup);
    }
    //Temp
    
    app.post("/:action", urlEncoder, async function(req, res) {
        switch(req.param('action')) {
            case "CreateAsset": {
                assetGroupRepository.AddAssetAsync(req.body);
                res.status(200).send("Success");
            } break;
            case "CreateAssetGroup": {
                assetGroupRepository.AddAssetGroup(req.body);
                res.status(200).send("Success");
            } break;
            case "GetAllAssetGroups": {
                res.status(200).send(await assetGroupRepository.GetAllAsync());
            } break;
    }});
}