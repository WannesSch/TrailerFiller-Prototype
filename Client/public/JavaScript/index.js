import { Grid } from './Models/Grid.js';

let AssetList = [];

//units in cm
let trailerHeight = 400;
let trailerWidth = 1200;
let trailerDepth = 260;

let viewWidth = 0;
let viewHeight = 0;

let currentAngle = "Front";

let pos = {}

let assetPos = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
}

let currentDraggable = null;
let currentAsset = null;

let _grid = null;

$(document).ready(() => {
    Initialize();

    $('.hamburger-menu').click(() => { ToggleHamburger(); })
    $('button[id^=Asset_Return]').each((index, ele) => { 
        $(ele).click(() => { 
            $('.CreateAsset').css('display', 'none');
            $('.CreateAssetGroup').css('display', 'none');
            $('.darkOverlay').css('display', 'none');
        })
    })
    $('#AssetMenuButton').click(() => { 
        $('.CreateAsset').css('display', 'flex');
        $('.darkOverlay').css('display', 'flex');
    });
    $('#AssetGroupMenuButton').click(() => { 
        $('.CreateAssetGroup').css('display', 'flex');
        $('.darkOverlay').css('display', 'flex');
    });

    $("#CreateAssetGroupForm").submit(function(e) {
        e.preventDefault();
        $.ajax({
         type: "POST",
          url: "/CreateAssetGroup",
          data: $(this).serialize(),
          success: function (textStatus, status) {
            Message(status, "#268f1d");
            UpdateData();
            setTimeout(() => {
                $('.darkOverlay').css('display', 'none');
                $('.CreateAssetGroup').css('display', 'none');
            }, 1500);
            },
            error: function(xhr, textStatus, error) {
                Message(xhr.responseText, "#fe0000");
            }
        })
    
    })

    $("#CreateAssetForm").submit(function(e) {
        e.preventDefault();
        $.ajax({
         type: "POST",
          url: "/CreateAsset",
          data: $(this).serialize(),
          success: function (textStatus, status) {
            Message(status, "#268f1d");
            UpdateData();
            setTimeout(() => {
                $('.darkOverlay').css('display', 'none');
                $('.CreateAsset').css('display', 'none');
            }, 1500);
            },
            error: function(xhr, textStatus, error) {
                Message(xhr.responseText, "#fe0000");
            }
        })
    
    })

    document.addEventListener('mousemove', (e) => {
        pos.x = e.clientX;
        pos.y = e.clientY;

        if (currentDraggable != null) {
            pos.offset = ($(currentDraggable).width() / 2) + 75

            $(currentDraggable).css({'left': pos.x - pos.offset , 'top': pos.y - 20});
            CheckPosition();
        }
    })
})

async function Initialize() {
    let angle = "Front";

    _grid = new Grid(trailerWidth, trailerHeight, trailerDepth, 20);
    _grid.Create3DGrid();

    switch(angle) {
        case "Front": {
            _grid.viewWidth = Math.floor($('.grid').width() / (_grid.gridWidth / _grid.gridInterval));
            _grid.viewHeight = $('.grid').height() / (_grid.gridHeight / _grid.gridInterval);
        } break;
    }
    
    for (let gI of _grid.grid) {
        gI.size.width = _grid.viewWidth;
        gI.size.height = _grid.viewHeight;
    }

    _grid.defaultGrid = _grid.GetGridItem(0, 0, 0);
    let id = 0;
        let view = _grid.Get2DView(angle);

        for (let gridItem of view) {
        
            let div = document.createElement("div");
                div.id = "grid_" + gridItem.x + "_" + gridItem.y + "_" + gridItem.z + "-" + id;
                id++;
                div.className = "gridItem";
                div.style.width = gridItem.size.width + "px";
                div.style.height = gridItem.size.height + "px";
                div.style.left = _grid.defaultGrid.size.width * gridItem.x + "px";
                div.style.top = _grid.defaultGrid.size.height * gridItem.y + "px";
                $('.grid').append(div)
    }

    UpdateData();
}

function UpdateData() {
    $.ajax({
        type: "POST",
        url: "/GetAllAssetGroups",
        data: $(this).serialize(),
        success: function (data, status) { 
            Message(status, "#268f1d"); 
            UpdateList(data);
        },
        error: function(xhr, textStatus, error) { Message(xhr.responseText, "#fe0000"); }
    })
}

function UpdateList(data) {
    AssetList = data;
    $('#AssetGroupSelect').empty();
    $('.assetMenu').empty();

    for (let assetGroup of AssetList) {
        $('#AssetGroupSelect').append(`<option>${assetGroup.name}</option>`);

        let html = "";
        html += `
        <li id="AssetGroup_${assetGroup.id}">
        <div>
            <div class="col">
                <p>${assetGroup.name}</p>
                <small>${assetGroup.description}</small>
            </div>
            <div class="col">
                <p class="arrow" id="arrow_${assetGroup.id}">&#x2771;</p>
            </div>
        </div>
        <ol id="AssetList_${assetGroup.id}">`;
        
        for (let asset of assetGroup.assetList)
            html += `<li id="Asset_${asset.id}"><span>-</span> ${asset.name}</li>`;

        html += '</ol>';
        html += '</li>';
        

        $('.assetMenu').append(html);
    }
    
    $('li[id^="AssetGroup_"]').each((index, ele) => { 
        $(ele).click(() => { ToggleAssetList($(ele).attr("id")) })
    })
}

function ToggleHamburger() {
    if ($('.hamburger-menu').hasClass('toggle')) {
        $('.hamburger-menu').removeClass('toggle');
        $('.assetMenu').css('display', 'none');
        $('#searchBar').css('display', 'none');
    } 
    else {
        $('.hamburger-menu').addClass('toggle');
        $('.assetMenu').css('display', 'flex');
        $('#searchBar').css('display', 'flex');
    }
}
function ToggleAssetList(id) {
    id = id.split('_')[1];
    if ($("#AssetList_" + id).hasClass('toggle')) {
        $("#AssetList_" + id).removeClass('toggle');
        $("#arrow_" + id).removeClass('toggle');
    }
    else {
        $("#AssetList_" + id).addClass('toggle');
        $("#arrow_" + id).addClass('toggle');
    } 

    $('li[id^=Asset_]').each((index, ele) => {
        $(ele).click(() => { CreateAsset($(ele).attr("id")); });
    })
    
}
function Message(msg, color) {
    $('.Message').html(msg);
    $('.Message').css('background', color);
    $('.Message').css('display', 'block');

    setTimeout(() => { $('.Message').css('display', 'none');}, 2000);
}

function GetAssetById(id) {
    let returnedModel = null;
    for (let assetGroup of AssetList) {
        for (let asset of assetGroup.assetList) 
        {
            if (asset.id == id) returnedModel = asset;
        }
    }

    return returnedModel;
}
function CreateAsset(id) {
    if (currentAsset != null) {
        //Message("Can't create multiple assets", "#fe0000");
        return;
    }
    id = id.split("_")[1]
    let asset = GetAssetById(id);

    asset.imgSrc = "../Images/Assets/Asset1/Asset1_Front.png";
    
    if (asset.id.indexOf("kokerpaal") >= 0) asset.imgSrc = `../Images/Assets/KokerPalen/${asset.name.replace(' ', '')}_Front.png`;
    if (asset.id.indexOf("asset2") >= 0) asset.imgSrc = "../Images/Assets/Asset2/Asset2_Front.png";

    let wrapper = document.createElement("div");
        wrapper.className = "assetWrapper";
        wrapper.style.top = '200px';
        wrapper.style.left = '600px';

    let buttonMenu = document.createElement("div");
        buttonMenu.className = "buttonMenu";

    let infoButton = document.createElement("div");
        infoButton.className = "assetButton info";
        infoButton.title = "Show asset information";

    let copyButton = document.createElement("div");
        copyButton.className = "assetButton copy";
        copyButton.title = "Copy asset";

    let removeButton = document.createElement("div");
        removeButton.className = "assetButton remove";
        removeButton.title = "De-select asset";

    let saveButton = document.createElement("div");
        saveButton.className = "assetButton save";
        saveButton.title = "Save asset location";

    let moveButton = document.createElement("div");
        moveButton.className = "assetButton move";
        moveButton.title = "Move asset";

    let assetWrapper = document.createElement("div");
        assetWrapper.id = "AssetItem_" + asset.id;
        assetWrapper.className = "AssetItem";
        assetWrapper.style.width = Math.ceil(asset.size.width / 20) * _grid.viewWidth + "px";
        assetWrapper.style.height = Math.ceil(asset.size.height / 20) * _grid.viewHeight + "px";

    let child = document.createElement("img");
        child.id = "AssetItemContent_" + asset.id;
        child.className = "AssetItemContent";
        child.src= `${asset.imgSrc}`;
        child.style.width = Math.ceil(asset.size.width / 20) * _grid.viewWidth + "px";
        child.style.height = Math.ceil(asset.size.height / 20) * _grid.viewHeight + "px";

    $(buttonMenu).append(infoButton, copyButton, removeButton, saveButton, moveButton);

    $(assetWrapper).append(child);
    $(wrapper).append(buttonMenu, assetWrapper);

    $('body').append(wrapper)
    currentAsset = wrapper;

    moveButton.onmousedown = function(e) { currentDraggable = wrapper; };
    moveButton.onmouseup = function(e) { currentDraggable = null; };

    removeButton.onclick = function(e) { 
        currentAsset.remove(); 
        currentAsset = null;
    }

    saveButton.onclick = function(e) {
        if (CheckPosition()) _grid.Attach(asset, assetPos, viewHeight, viewWidth);
    }
}

function CheckPosition() {
    let offset = {
        left: parseInt($('.trailer').css('left').replace('px', '')),
        top: parseInt($('.trailer').css('top').replace('px', ''))
    } 

    let assetOffset = {
        left: Math.ceil(parseInt($(currentAsset).css('left').replace('px', '')) + ($(currentAsset).width() / 2) - ($($(currentAsset).children()[1]).width() / 2)),
        top: Math.ceil(parseInt($(currentAsset).css('top').replace('px', '')) + 67.5),
        right: Math.ceil(parseInt($(currentAsset).css('left').replace('px', '')) + ($(currentAsset).width() / 2) + ($($(currentAsset).children()[1]).width() / 2)),
        bottom: Math.ceil(parseInt($(currentAsset).css('top').replace('px', '')) + $(currentAsset).height())
    }

    assetPos = {
        left: assetOffset.left - offset.left,
        right: assetOffset.right - offset.left,
        top: assetOffset.top - offset.top,
        bottom: assetOffset.bottom - offset.top
    }

    let c = $(currentAsset).attr('class');
    
    if (assetPos.left < 0 || assetPos.right > 900 || assetPos.top < 0 || assetPos.bottom > 180) {
        $(`.${c} .AssetItem`)[0].style.background = 'rgba(190, 19, 19, 0.507)';
        return false;
    }
    else {
        if(_grid.CheckGridPosition(null, assetPos)) $(`.${c} .AssetItem`)[0].style.background = 'rgba(19, 180, 19, 0.507)';
        else {$(`.${c} .AssetItem`)[0].style.background = 'rgba(190, 19, 19, 0.507)'; return false}
        return true;
    }
}

