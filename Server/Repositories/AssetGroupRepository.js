const { AssetGroup } = require('../Models/AssetGroup.js');
const { Asset } = require('../Models/Asset.js');

class AssetGroupRepository {
    constructor() {
        this.AssetGroups = [];
    }

    async GetAsync(id) {

    }
    async GetAssetGroupByName(name) {
        let group = null;
        for (let assetgroup of this.AssetGroups) {
            if (assetgroup.name == name) group = assetgroup
        }

        return group;
    }
    GetAssetGroupId() {
        let id = 0;

        for (let assetgroup of this.AssetGroups) {
            if (assetgroup.id == id) id++;
        }

        return id;
    }
    GenerateID(length) {
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ )
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
    
        return result;
    }
    async GetAllAsync() { return new Promise((resolve, reject) => {resolve(this.AssetGroups)}) }
    async AddAssetAsync(data) {
        let group = await this.GetAssetGroupByName(data.AssetGroup);
        let asset = new Asset(this.GenerateID(7), data.AssetName, data.AssetWeight, data.AssetWidth, data.AssetHeight, data.AssetDepth);

        group.assetList.push(asset);
    }
    AddAssetGroup(data) { this.AssetGroups.push(new AssetGroup(this.GetAssetGroupId(), data.AssetGroupName, data.AssetGroupDescription)); }
    async RemoveAssetGroupAsync(_assetGroup) {}
}

module.exports = { AssetGroupRepository }