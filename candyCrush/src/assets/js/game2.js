

var newGame;
var currentSize=4;
var levelScore=1000;
var currentCountDown;
var currentScore=0;
var Game = function() {
	
	this.init = function(size, base, ui) {
		this.base = base;
		this.ui = ui;
		this.originalSize = size;
		this.size = this.originalSize * this.originalSize;
		this.caseHeight = base.height() / this.originalSize;
		this.level = [];
		this.typesOfGems = 5;
		this.fillEnd = true;
		this.switchEnd = true;
		this.playerCanControl = false;
		this.populateLevel();
		this.drawNewLevel();
		this.score = 0;
		this.combo = 0;
		this.bestCombo = 0;

		setTimeout($.proxy(this.checkLines, this), 1000);
	};

	this.releaseGameControl = function(play) {
		if (play) {
			this.playerCanControl = true;
			//this.bindDraggableEvent();
		} else {
			this.playerCanControl = false;
			//base.find('.row').hammer().off('swipeleft swiperight swipeup swipedown');
		}
	};

	this.bindDraggableEvent = function() {
		var that = this;
		var position;

		this.base.hammer().on('dragleft dragright dragup dragdown', '.row', function(event) {
			
			//console.log('swipe', this, event);

			event.gesture.preventDefault();

			position = +$(this).attr('data-id');
			
			if (position !== undefined) {
				that.testMove(position, event.type);
				event.gesture.stopDetect();
				return;
			}
		});
	};

	this.testMove = function(position, direction) {
		switch(direction) {
			case "dragleft":
				if (position % this.originalSize !== 0) {
					this.swipeGems(this.base.find('.row[data-id='+position+']'), position, this.base.find('.row[data-id='+(position - 1)+']'), position - 1);
			}
			break;

			case "dragright":
				if (position % this.originalSize !== this.originalSize - 1) {
					this.swipeGems(this.base.find('.row[data-id='+position+']'), position, this.base.find('.row[data-id='+(position + 1)+']'), position + 1);
				}
			break;

			case "dragup":
				this.swipeGems(this.base.find('.row[data-id='+position+']'), position, this.base.find('.row[data-id='+(position - this.originalSize)+']'), position - this.originalSize);
			break;

			case "dragdown":
				this.swipeGems(this.base.find('.row[data-id='+position+']'), position, this.base.find('.row[data-id='+(position + this.originalSize)+']'), position + this.originalSize);
			break;
		}
	};

	this.swipeGems = function(a, aID, b, bID) {

		//console.log("switch: ", aID, bID);

		if (this.switchEnd && a !== undefined && b !== undefined && aID >= 0 && bID >= 0 && aID <= this.size && bID <= this.size) {

			var that = this;
			var aTop = a.css('top');
			var aLeft = a.css('left');
			var bTop = b.css('top');
			var bLeft = b.css('left');
			var aType = this.level[aID];
			var bType = this.level[bID];

			this.switchEnd = false;

			this.level[aID] = bType;
			this.level[bID] = aType;

			this.comboUpdate(0);

			//console.log("a&b types: ", bType, aType);

			a.attr('data-id', bID).animate({
				top: bTop,
				left: bLeft
			}, 250);

			b.attr('data-id', aID).animate({
				top: aTop,
				left: aLeft
			}, 250, function() {
				that.switchEnd = true;
				that.checkLines();
			});
		}
	};

	this.populateLevel = function() {
		var i;
		for (i = 0; i < this.size; i++) {
			//not use 0
                        
			this.level[i] = Math.round(Math.random() * this.typesOfGems + 1);
		}
	};

	this.drawNewLevel = function() {
		var i;
		var row = $(document.createElement('div'));
		var lines = -1;

		$('.row').remove();

		for (i = 0; i < this.size; i++) {

			if (i % this.originalSize === 0) {
				lines++;
			}

			row.css({
				top: lines * this.caseHeight,
				left: i % this.originalSize * this.caseHeight,
				height: this.caseHeight,
				width: this.caseHeight
			}).attr({
				"class": 'type-' + this.level[i] + ' row',
				"data-id": i
			});

			this.base.append(row.clone());
		}

		this.lines = lines + 1;
		this.itemByLine = this.size / this.lines;

		this.bindDraggableEvent();
		this.releaseGameControl(true);
	};

	this.checkLines = function() {
		var k;
		var counter = 0;

		//reset
		this.base.find('.row').removeClass('.glow');

		for (k = 0; k < this.size; k++) {
			counter = counter + this.checkGemAround(this.level[k], k);
		}

		if (counter === this.size) {
			this.releaseGameControl(true);
			return true;
		} else {
			this.releaseGameControl(false);
			return false;
		}
	};

	this.checkGemAround = function(gemType, position) {
		var flag = false;
                 //check horizntal chain
		if ( this.level[position - 1] === gemType && this.level[position + 1] === gemType && (position + 1) % this.lines !== 0 && position % this.lines ){
                   //alert(this.level[position - 1]+" "+this.level[position + 1]+" "+gemType)
                   var l=3;
                   var temp=[position, position - 1, position + 1];
                   for(var k=position+2;k<this.itemByLine+position;k++){
                       if(this.level[k]!==gemType){
                           break;
                       }
                       //alert(k);
                       temp.push(k);
                       l++;
                   }
                    this.removeClearedGemToLevel(temp);
		} else {
			flag = true;
		}
                //check for vertical chain
		if ( this.level[position - this.itemByLine] === gemType && this.level[position + this.
			itemByLine] === gemType ){
                //alert("col "+position +" "+ (this.itemByLine+position));
                     var l=3;
                     var temp=[position - this.itemByLine, position, position + this.itemByLine];
                     for(var y=position + this.itemByLine;y<this.size  ;y+=this.itemByLine){
                         
                        if(this.level[y]!==gemType){
                           
                           break;
                        }
                        temp.push(y);
                        //alert(y)
                        l++;
                   }
                    this.removeClearedGemToLevel(temp);
		} else {
			flag = true;
		}

		if (flag) {
			return 1;
		} else {
			return 0;
		}
	};

	this.removeClearedGemToLevel = function(gemsToRemove) {
		var i;
		
		for (i = 0; i < gemsToRemove.length; i++) {
			this.level[gemsToRemove[i]] = 0;
			this.animateRemoveGems(gemsToRemove[i]);
		}
	};

	this.animateRemoveGems = function(position) {
		var that = this;

		var difference = this.caseHeight / 2;

		this.base.find('.row[data-id='+position+']')
		.attr('data-id', false)
		.addClass('glow').animate({
			marginTop: difference,
			marginLeft: difference,
			height: 0,
			width: 0
		}, 500, function() {
			$(this).remove();
			that.scoreUpdate(100);
		});

		if (that.fillEnd) {
			that.comboUpdate(1);
			that.fillHoles();
		}
	};

	this.moveGems = function(position, line, colPosition, destination) {
		var that = this;

		this.base.find('.row[data-id='+position+']').animate({
			top: Math.abs(line * that.caseHeight)
		}, 100, "swing").attr('data-id', destination);

		this.level[destination] = this.level[position];
		this.level[position] = 0;

		if (line === 1) {
			this.createNewRandomGem(colPosition);
		}
	};

	this.createNewRandomGem = function(colPosition) {
		// console.log("createNewRandomGem", colPosition);

		var that = this;
		var gem = $(document.createElement('div'));

		this.level[colPosition] = Math.round(Math.random() * this.typesOfGems + 1);

		gem.addClass('type-' + this.level[colPosition] +' row').css({
			top: -this.caseHeight,
			left: colPosition * this.caseHeight,
			height: this.caseHeight,
			width: this.caseHeight,
			opacity: 0
		}).attr({
			"data-id": colPosition
		});

		gem.appendTo(this.base);

		gem.animate({
			top: 0,
			opacity: 1
		},200);

		this.bindDraggableEvent();
	};

	this.fillHoles = function(){
		// console.log("fillHoles");

		var i;
		var counter = 0;

		this.releaseGameControl(false);

		this.fillEnd = false;

		for (i = 0; i < this.level.length; i++) {

			var under = i + this.originalSize;
			var lignePosition = Math.floor(under / this.originalSize);
			var colPosition = under - Math.floor(lignePosition * this.originalSize);
			
			if (this.level[under] === 0 && this.level[i] !== 0) {

				if (this.level[under] === 0 && this.level[under] !== undefined) {
					this.moveGems(i, lignePosition, colPosition, under);
				}

				break;
			
			} else if (this.level[i] === 0) {
				this.createNewRandomGem(colPosition);
			} else if (this.level[i] !== 0) {
				counter++;
			}
		}

		//console.log(this.level.length, counter);

		if (this.level.length === counter) {
			//console.log('no hole left');
			this.fillEnd = true;
			return setTimeout($.proxy(this.checkLines, this), 50);
		} else {
			return setTimeout($.proxy(this.fillHoles, this), 50);
		}
	};


	this.scoreUpdate = function(score){
		this.score = Math.floor(this.score + score / 3, 10);
		this.ui.find('.score').text(this.score);
               // alert(currentCountDown())
           
                if(this.score>=levelScore)
                {
                        
                    var $game = $('#game');
                    var $ui = $('#ui');	
		
                    //console.log(value);
                    newGame = new Game();
                    newGame.init(currentSize+2, $game, $ui);
                    levelScore*=currentSize/2;
                    currentCountDown = createCountDown(35000);
                    alert(levelScore);
                    countdown();
	
                }
	};

	this.comboUpdate = function(combo){

		if (combo > 0) {
			this.combo = this.combo + combo;
			this.ui.find('.combo').text(this.combo);
		} else {
			this.combo = 0;
		}

		if (this.combo >= this.bestCombo) {
			this.bestCombo = this.combo;
			this.ui.find('.bestCombo').text(this.bestCombo);
		}
	};
};


$(document).ready(function() {
	var $game = $('#game');
	var $ui = $('#ui');	
        //var bleep = new Audio(); 
       // bleep.src = '../src/candy_crush_soda.mp3';
        //bleep.muted=false;bleep.play();
	$('.message button').on('click', function(event) {
		event.preventDefault();
		var value = +$(this).val();
                currentSize=value;
		$('.message').hide();
		//console.log(value);
		newGame = new Game();
		newGame.init(value, $game, $ui);
                currentCountDown = createCountDown(30000);
               
		countdown();
	});

});

function createCountDown(timeRemaining) {
    var startTime = Date.now();
    return function() {
       return timeRemaining - ( Date.now() - startTime );
    }
}
function countdown(){
    //alert(currentCountDown());
    var counter=currentCountDown();
    $('.twitterButton').text(counter);
    if(counter<0){
        if(currentScore<1000){
            $('.twitterButton').text(0);
            $('#game').text("Game Over");
        }
        else {
            currentCountDown = createCountDown(30000);
            var $game = $('#game');
            var $ui = $('#ui');	

            //console.log(value);
            newGame = new Game();
            newGame.init(currentSize+2, $game, $ui);
            levelScore*=currentSize/2;
        }
    }
    setTimeout("countdown()",1000);
}
