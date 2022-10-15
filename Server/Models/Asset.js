//Dimensions in cm

class Asset {
    constructor(_id, _name, _weight, _width, _height, _depth, _frontSprint, _topSprint) {
        this.id = _id;
        this.name = _name;
        this.weight = _weight;
        this.size = {
            width: _width,
            height: _height,
            depth: _depth
        }
        this.sprints = {
            front: _frontSprint,
            top: _topSprint
        }
    }
}

module.exports = { Asset }