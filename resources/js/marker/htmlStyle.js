const initHTMLObjects = () => {
    var canvasMaster = document.getElementById('renderCanvas');
    var divLoading = document.createElement('div');
    divLoading.id = 'divLoading';
    divLoading.className = "loading";
    canvasMaster.appendChild(divLoading);
    var boxCanvas = document.createElement('canvas');
    boxCanvas.id = 'boxCanvas';
    boxCanvas.className = "boxCanvas";
    boxCanvas.style.transform = "scale(1,1)";
    boxCanvas.width = 4096;
    boxCanvas.height = 2048;
    canvasMaster.appendChild(boxCanvas);
    boxCanvas.style.display = 'none';
    boxCanvas.getContext("2d").font = '10px samsung';

    var info = document.createElement('div');
    info.id = 'info';
    info.className = 'info';
    info.textContent = 'info';
    canvasMaster.appendChild(info);

    return canvasMaster;
}

const stylePortrait = () => {
    let rendererDomElement = document.getElementById('renderCanvasContext');
    let divLoading = document.getElementById('divLoading');
    let canvasMaster = document.getElementById('renderCanvas');

    rendererDomElement.style.height = canvasMaster.offsetWidth + 'px';
    rendererDomElement.style.width = parseFloat(canvasMaster.offsetWidth) / 0.75 + 'px';
    canvasMaster.style.marginBottom = '15%';
    // rendererDomElement.style.marginTop = '15%';
    divLoading.style.width = rendererDomElement.offsetHeight + 'px';
    divLoading.style.height = rendererDomElement.offsetWidth + 'px';
    // divLoading.style.marginLeft = '17%';
}

const styleLandscape = () => {
    let rendererDomElement = document.getElementById('renderCanvasContext');
    let divLoading = document.getElementById('divLoading');

    rendererDomElement.style.height = '100%';
    rendererDomElement.style.position = 'absolute';
    rendererDomElement.style.width = (rendererDomElement.offsetHeight / 0.75) + 'px';
    divLoading.style.width = rendererDomElement.offsetWidth + 'px';
    divLoading.style.height = rendererDomElement.offsetHeight + 'px';
    divLoading.style.margin = 'auto';
    divLoading.style.left = '0';
    divLoading.style.right = '0';
}