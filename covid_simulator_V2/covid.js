$(document).ready(function(){
    document.getElementById('populationMalade').value = 1
    document.getElementById('r0').value = 2
    document.getElementById('populationMax').value = 12000
})

$(document).resize(function(){
    adaptiveSize();
})
var initPop = parseInt($('#populationMalade')[0].value)
var total = initPop
var simulation = document.getElementById("sim");
var iconSize = 350
var iconClass = "icon fas fa-male"
var pid
var maxPop = document.getElementById('populationMax').value;
var maxPopCritique = 50000
var maxNb = 30000
var tabAge = [];
var pauseButton = document.getElementById('pause')
var graphButton = document.getElementById('graph')
var semainesMax = 100;
var deathTab = [];
var tabSemaine = [];
var currentlySickTab = [];
var curedTab = [];
var totalSickTab = [];

Chart.scaleService.updateScaleDefaults('linear', {
    ticks: {
        min: 0
    }
});

function heal(element){
    element.classList.remove('canInfect')
    element.classList.add('immune')
    element.style.color = '#1df177'
    tabAge.push(parseInt(element.getAttribute("age"))+1)
}

function kill(element){
    element.classList.remove('canInfect')
    element.classList.add('dead')
    element.style.color = "#2b2a2a"
    tabAge.push(parseInt(element.getAttribute("age"))+1)
}

function togglePause(){
    if(pauseButton.getAttribute('paused') == "true"){
        pauseButton.innerHTML = "Pause"
        pauseButton.setAttribute('paused', false)
    } else {
        pauseButton.innerHTML = "Reprendre"
        pauseButton.setAttribute('paused', true)
    }
}


function toggleGraph(){
    textGraph = document.getElementById('zone-graph')
    if(textGraph.style.display == ""){
        textGraph.style.display = "none"
        graphButton.innerHTML = "Afficher détails"
    } else {
        textGraph.style.display = ""
        graphButton.innerHTML = "Cacher détails"
    }
}


function simulate(){
    currentlySickTab = []
    deathTab = []
    curedTab = []
    totalSickTab = []
    tabSemaine = []
    
    
    document.getElementById('start').innerHTML = 'Relancer'
    simulation.innerHTML = ""
    clearInterval(pid)
    iconSize=350;
    var week = 0
    initPop = parseInt($('#populationMalade')[0].value)
    total = initPop
    var objetTitre = document.getElementsByClassName("header")
    
    var worstTotal = total
    var worstNb = worstTotal

    objetTitre[0].innerHTML="0 semaines"
    objetTitre[1].innerHTML=total+" total ("+"+"+initPop+")"
    appendChilds(simulation, genMultipleEltIcon(initPop, "init"))
    adaptiveSize()
    
    all = document.getElementsByClassName('icon')
    total = all.length
    
    // Boucles des générations ICI
    pid = setInterval(function (){
        if(pauseButton.getAttribute('paused') == "true") return
        
        maxPop = document.getElementById('populationMax').value

        var allPersons = document.getElementsByClassName('icon')

        for (let index = 0; index < allPersons.length; index++) {
            const element = allPersons[index];
            if(element.classList.contains('canInfect')){
                finished=false;
                if(element.getAttribute('age') >= 2){
                    element.classList.remove('canInfect')
                    var randomness = Math.floor(Math.random() * 100)
                    if(randomness > 100-2){
                        kill(element)
                    } else {
                        heal(element)
                    }
                } else {
                    var age = element.getAttribute('age')
                    if(age == 0){
                        var randomness = Math.floor(Math.random() * 100)
                        
                        if(randomness > 100-1){
                            kill(element)
                        } else {
                            if(randomness > 100-10){
                                heal(element)
                            }
                        }
                    }

                    if(age == 1){
                        var randomness = Math.floor(Math.random() * 100)
                        if(randomness > 100-2.5){
                            kill(element)
                        } else {
                            if(randomness > 100-60-2.5){
                                heal(element)
                            }
                        }
                    }

                    element.setAttribute("age", parseInt(element.getAttribute('age'))+1)
                }
            }
        
        }

        var nbCanInfect = document.getElementsByClassName('canInfect').length

        if(total > maxPopCritique) {
            alert("Limite de population atteinte.")
            clearInterval(pid)
            return
        }
        
        if(week == semainesMax-1) clearInterval(pid)

        var r0saved = $('#r0')[0].value
        if(r0saved<=1.2)
        {
            r0= r0saved-0.2;
        }
        else if(r0saved<1.7)
        {
            r0=r0saved-0.1;
            
        }
        else{
            r0=r0saved;
        }
   
        var nb = parseInt(nbCanInfect*r0)
        worstNb = parseInt((worstNb)*r0)

        if(nb > maxNb){
            alert("Limite de malades supplémentaires par semaine atteinte.")
            clearInterval(pid)
            return
        }

        appendChilds(simulation, genMultipleEltIcon(nb, week))
        // $('.icon').css('transition',2+'s');
        adaptiveSize()

        
        all = document.getElementsByClassName('icon')
        total = all.length
        worstTotal += worstNb

        var morts = $('.dead').length
        var cured = $('.immune').length
        
        var mortality = parseInt(100*morts/total)
        objetTitre[0].innerHTML=week+1+" semaines"
        
        objetTitre[1].innerHTML=total+" cas cumulés ("+"+"+nb+") dont "+cured+" <b style='color:#56c774'>immunisés</b>, "+morts+" ("+mortality+"%) <b>morts</b>, "+nbCanInfect+" malades actuels"
        //objetTitre[1].innerHTML += "<br>Pire scénario : " + worstTotal + " malades (+"+worstNb+")"
        tabSemaine.push(week+1);
        deathTab.push(parseInt(morts));
        totalSickTab.push(total);
        curedTab.push(cured);
        currentlySickTab.push(nbCanInfect)
        generateDeathChart()
        week++        
    }, 4000)
}

function appendChilds(parent, childs){
    
    for (const key in childs) {
        if (childs.hasOwnProperty(key)) {
            const element = childs[key];
            parent.appendChild(element)
            setTimeout(function(){
                element.style.fontSize = iconSize + "px"
            }, 200)
        }
    }
}

function genEltIcon(id){
    var elt = document.createElement("i")
    elt.setAttribute('id', id)
    elt.setAttribute('class', iconClass + " canInfect")
    elt.setAttribute('age', 0)
    elt.style.fontSize = "0px"
    elt.style.color = getRandomColor()
    
    return elt
}

function genMultipleEltIcon(nb,id){
    
    var arr = []
    if(total<maxPop)
    {
        for(let i = 0; i<nb ; i++){
            arr.push(genEltIcon(id+''+i))
        }
    }   
    return arr
}

function getRandomColor() {
    var colors = ['e73b5b', 'cf52db','a061d2','5180cb','d6a36c','f88d47','be3135','f74334'];

    return "#"+colors[Math.floor(Math.random() * colors.length)];
}

function adaptiveSize(){
    var nbElement = simulation.childElementCount;    
    if(nbElement == 0) return;

    var windowHeight  = window.innerHeight
    var windowWidth = window.innerWidth
    var jumbotronHeight = document.getElementsByClassName('container-fluid')[0].offsetHeight
    var contentHeight = windowHeight - 28*2 - jumbotronHeight
    var contentWidth = windowWidth - 28*2

    // var iconMargin = getStyleAttributeByClassName("icon", "margin-left");
    var iconHeight = document.getElementsByClassName('icon')[0].clientHeight
    var iconWidth = document.getElementsByClassName('icon')[0].clientWidth

    if(iconHeight == 0 || iconWidth == 0) return

    var surfaceEcran = contentHeight * contentWidth
    var surfaceIcon = (iconHeight*iconWidth) * nbElement

    if(surfaceIcon < surfaceEcran) return

    iconSize = Math.max(iconSize * surfaceEcran / surfaceIcon ,17)
    $('.icon').css('font-size',iconSize+'px');
    return iconSize;
}

function getStyleAttributeByClassName(classname, attr){
    var el = document.getElementsByClassName(classname)[0];
    var style = window.getComputedStyle(el, null).getPropertyValue(attr);
    var value = parseFloat(style); 
    
    // now you have a proper float for the font size (yes, it can be a float, not just an integer)
    return (value);
}



var deathChart = document.getElementById('death-chart');
var sickChart = document.getElementById('sick-chart');
var myDeathChart = new Chart(deathChart, {
    type: 'line',
    data: 
    {
        labels: tabSemaine,
        datasets:
        [{
            data: deathTab,
            label:"morts",
            borderColor: "#2b2a2a",
            fill: false,
        }]
    },
    options: 
    {
        title: 
        {
        display: true,
        text: 'Morts cumulées du virus'
        },
        cubicInterpolationMode:"monotone",
        scales: {
            yAxes: [{
                ticks: {
                    stepSize: 50,
                }
            }]
        }
        ,
        responsive:"true",
    }
});
    
var mySickChart = new Chart(sickChart, {
    type: 'line',
    data: 
    {
        labels: tabSemaine,
        datasets:
        [{
            data: currentlySickTab,
            label:"Malades Actuels",
            borderColor: "#be3135",
            fill: false,
        },
        {
            data: totalSickTab,
            label:"Total des cas",
            borderColor: "#cecece"
        },
        {
            data: curedTab,
            label:"Guéris",
            borderColor: "#1df177",
            fill: false, 
        }]
    },
    options: 
    {
        title: 
        {
        display: true,
        text: 'Suivi des cas'
        },
        cubicInterpolationMode:"monotone",
        scales: {
            yAxes: [{
                ticks: {
                    stepSize: 1000,
                }
            }]
        }
        ,
        responsive:"true",
        responsiveAnimationDuration: 500,
        maintainAspectRatio: false,


    }
});

//// charts
function generateDeathChart(){
    mySickChart.data.labels = tabSemaine
    mySickChart.data.datasets[0].data = currentlySickTab
    mySickChart.data.datasets[1].data = totalSickTab
    mySickChart.data.datasets[2].data = curedTab
    mySickChart.update()

    myDeathChart.data.labels = tabSemaine
    myDeathChart.data.datasets[0].data = deathTab
    myDeathChart.update()
}