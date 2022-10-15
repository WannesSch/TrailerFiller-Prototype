class AssetGroup {
    constructor(_id, _name, _description) {
        this.id = _id;
        this.name = _name;
        this.description = _description;
        this.assetList = [];
    }
}

module.exports = { AssetGroup }