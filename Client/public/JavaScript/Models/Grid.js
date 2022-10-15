'use strict';
class Grid {
    constructor(_gridWidth, _gridHeight, _gridDepth, _gridInterval) {
        this.grid = [];
        this.placedAssets = [];
        this.gridWidth = _gridWidth;
        this.gridHeight = _gridHeight;
        this.gridDepth = _gridDepth;
        this.gridInterval = _gridInterval;
        this.defaultGrid = null;

        this.viewWidth = 0;
        this.viewHeight = 0;

        this.totalWeight = 0;
    }

    Create3DGrid() {
        for (let x = 0; x<(this.gridWidth / this.gridInterval); x++) {
            for (let y = 0; y<(this.gridHeight / this.gridInterval); y++) {
                for(let z = 0; z<(this.gridDepth / this.gridInterval); z++) {
                    this.grid.push(new GridItem(x, y, z));
                }
            }
        }
    }
    Get2DView(angle) {
        let view = [];

        if (angle == "Front") {
            for (let i = 0; i<this.grid.length; i++)
                if (this.grid[i].z == 0) view.push(this.grid[i]);
        }

        if (angle == "Back") {
            for (let i = 0; i<this.grid.length; i++)
                if (this.grid[i].z == (this.gridDepth / this.gridInterval) - 1) view.push(this.grid[i]);
        }

        if (angle == "Top") {
            for (let i = 0; i<this.grid.length; i++)
                if (this.grid[i].y == (this.gridHeight / this.gridInterval) - 1) view.push(this.grid[i]);
        }

        return view;
    }

    async MergeGridItems(startGridItem, endGridItem) {
        let startIndex = null;
        return new Promise((resolve, reject) => {
                for (let i = 0; i<this.grid.length; i++) {
                    let gridItem = this.grid[i];
                    if (
                        gridItem.x >= startGridItem.x &&
                        gridItem.y >= startGridItem.y &&
                        gridItem.z >= startGridItem.z &&
                        gridItem.x <= endGridItem.x && 
                        gridItem.y <= endGridItem.y && 
                        gridItem.z <= endGridItem.z
                        ) {
                        if (!startIndex) startIndex = i;
                        this.grid.splice(this.grid.indexOf(gridItem), 1);
                    }
                }
                let newGridItem = new GridItem(startGridItem.x, startGridItem.y, startGridItem.z);
                newGridItem.size.width = (endGridItem.x + 1) * endGridItem.size.width;
                newGridItem.size.height = ((endGridItem.y - startGridItem.y) + 1) * endGridItem.size.height;

                this.grid.push(newGridItem);
                resolve(newGridItem);
        })  
    }

    PlaceAsset(asset, startGridItem, endGridItem) {
        let startIndex = null;
        for (let i = 0; i<this.grid.length; i++) {
            let gridItem = this.grid[i];
            if (
                gridItem.x >= startGridItem.x &&
                gridItem.y >= startGridItem.y &&
                gridItem.z >= startGridItem.z &&
                gridItem.x <= endGridItem.x && 
                gridItem.y <= endGridItem.y && 
                gridItem.z <= endGridItem.z
                ) {
                if (!startIndex) startIndex = i;
                gridItem.available = false;
            }
        }

        let newGridItem = new GridItem(startGridItem.x, startGridItem.y, startGridItem.z);
        newGridItem.size.width = ((endGridItem.x - startGridItem.x) + 1) * endGridItem.size.width;
        newGridItem.size.height = ((endGridItem.y - startGridItem.y) + 1) * endGridItem.size.height;
        newGridItem.imgSrc = asset.imgSrc;

        this.placedAssets.push(newGridItem);
        this.totalWeight += asset.weight;
        $('#weight').html(this.totalWeight)
    }

    GetGridItem(x, y, z) {
        let _gridItem = null;

        for (let gridItem of this.grid) {
            if (gridItem.x == x && gridItem.y == y && gridItem.z == z) _gridItem = gridItem;
        }

        return _gridItem;
    }

    Attach(asset, pos) {
        let gridPositions = this.GetGridByPostion(pos);
        this.PlaceAsset(asset, gridPositions[0], gridPositions[1]);
        this.UpdateGrid();
        /*this.MergeGridItems(startGrid, endGrid).then(() => {})*/
    }

    async UpdateGrid() {
        let id = 0;
        let view = this.Get2DView("Front");
        $('.grid').empty();
        for (let gridItem of view) {
        
            let div = document.createElement("div");
                div.id = "grid_" + gridItem.x + "_" + gridItem.y + "_" + gridItem.z + "-" + id;
                id++;
                div.className = "gridItem";
                div.style.width = gridItem.size.width + "px";
                div.style.height = gridItem.size.height + "px";
                div.style.left = this.defaultGrid.size.width * gridItem.x + "px";
                div.style.top = this.defaultGrid.size.height * gridItem.y + "px";
                $('.grid').append(div)
        }

        let _id = 0;
        for (let placedAsset of this.placedAssets) {
            let img = document.createElement("img");
                img.id = "placedAsset_" + _id;
                id++;
                img.className = "placedAsset";
                img.style.width = placedAsset.size.width + "px";
                img.style.height = placedAsset.size.height + "px";
                img.style.left = this.defaultGrid.size.width * placedAsset.x + "px";
                img.style.top = this.defaultGrid.size.height * placedAsset.y + "px";
                img.src= `${placedAsset.imgSrc}`;
                $('.grid').append(img);
        }   
    }

    CheckGridPosition(asset, pos) {
        let gridPositions = this.GetGridByPostion(pos);

        let valid = true;

        let startIndex = null;
        for (let i = 0; i<this.grid.length; i++) {
            let gridItem = this.grid[i];
            if (
                gridItem.x >= gridPositions[0].x &&
                gridItem.y >= gridPositions[0].y &&
                gridItem.z >= gridPositions[0].z &&
                gridItem.x <= gridPositions[1].x && 
                gridItem.y <= gridPositions[1].y && 
                gridItem.z <= gridPositions[1].z
                ) {
                if (!startIndex) startIndex = i;
                if(!gridItem.available) valid = false;
            }
        }

        return valid;
    }

    GetGridByPostion(pos) {
        let startGrid = this.GetGridItem(Math.round(pos.left / this.viewWidth), Math.round(pos.top / this.viewHeight) - 1, 0);
        let endGrid = this.GetGridItem(Math.round(pos.right / this.viewWidth) - 1, Math.round(pos.bottom / this.viewHeight) - 1, 0);
        return [startGrid, endGrid]
    }
}

class GridItem {
    constructor(_x, _y, _z) {
        this.x = _x;
        this.y = _y;
        this.z = _z;

        this.size = {
            width: 0,
            height: 0,
            depth: 0
        }

        this.available = true;

        this.imgSrc = "";
    }
}

export { Grid };