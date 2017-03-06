
var newGame;
var currentSize=4;
var levelScore=1000;
var currentCountDown;
var currentScore=0;
var removeFlag=false;

var bleep = new Audio(); 
bleep.src = '../src/candy_crush_soda.mp3';
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
                countTime();
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
           // alert("swap");
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
                              
                                if(removeFlag==false){
                                    that.resawp(a, aID, b, bID);
                                    removeFlag=false;
                                }
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
        this.resawp=function (a, aID, b, bID) {
//        alert("Resawwwwwwwwap Function Begine");
        //replace b with a
        //alert("reswap");
        var that2 = this;
        var aTop2 = a.css('top');
        var aLeft2 = a.css('left');
        var bTop2  = b.css('top');
        var bLeft2 = b.css('left');
        var aType2 = that2.level[aID];
        var bType2 = that2.level[bID];

//        this.switchEnd = false;

        this.level[aID] = bType2;
        this.level[bID] = aType2;

        this.comboUpdate(0);

        //console.log("a&b types: ", bType, aType);

        a.attr('data-id', aID).animate({
            top: bTop2,
            left: bLeft2
        }, 250);

        b.attr('data-id', bID).animate({
            top: aTop2,
            left: aLeft2
        }, 250, function () {
          //  that.switchEnd = true;
        });
//    alert("Resawwwwwwwwap Function Body: "+aID+"  and bID: "+bID);
    };
	this.checkLines = function() {
               removeFlag=false;
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
        this.checkLShape=function (gemType, position,filledArray){
          //  alert("check shape called")
            if ( this.level[position + this.itemByLine] === gemType && this.level[position +(2* this.
			itemByLine)] === gemType ){
                 
                  
                     filledArray.push(position+this.itemByLine);
                     filledArray.push(position+(2*this.itemByLine));
                    
                     
                     for(var y=position +3*this.itemByLine;y<this.size  ;y+=this.itemByLine){
                         
                        if(this.level[y]!==gemType){
                           
                           break;
                        }
                        filledArray.push(y);
                     }
            }
            return filledArray;
        };
        this.checkLShapev=function (gemType, position,filledArray){
            if ( this.level[position -1] === gemType && this.level[position +1] === gemType && (position + 1) % this.lines !== 0 && position % this.lines ){
                    
                    filledArray.push(position-1);
                    filledArray.push(position-2);

                     for(var y=position +2;y<(Math.floor(position/this.itemByLine)+1)*this.itemByLine;y++){
                         
                        if(this.level[y]!==gemType){
                           
                           break;
                        }
                        filledArray.push(y);                      
                       
                     }
            }
            return filledArray;
        };
	this.checkGemAround = function(gemType, position) {
            var flag = false;
            //check horizntal chain
		if ( this.level[position - 1] === gemType && this.level[position + 1] === gemType && (position + 1) % this.lines !== 0 && position % this.lines ){
                   
                   //alert("horizental chain")
                   var l=0;
                   var temp=[position, position - 1, position + 1];
                  // temp=this.checkLShape(gemType,position - 1,temp);
                  // temp=this.checkLShape(gemType,position + 1,temp);
                 //  temp=this.checkLShape(gemType,position ,temp);
                   var k;
                 
                //check horizental
                    var boundary=(Math.floor(position/this.itemByLine)+1)*this.itemByLine;
                    for(k=position+2;k<boundary;k++){
                        if(this.level[k]!==gemType){
                               break;
                        }
                        temp.push(k);
                       // temp=this.checkLShape(gemType,k,temp);
                    }
                        this.removeClearedGemToLevel(temp);
                    } else {
                            flag = true;
                    }                
                    temp=new Array();
                    //check for vertical chain
                    if ( this.level[position - this.itemByLine] === gemType && this.level[position + this.
			itemByLine] === gemType ){
                
                        var temp=[position - this.itemByLine, position, position + this.itemByLine];
                       // temp=this.checkLShapev(gemType,position - 1,temp);
                       // temp=this.checkLShapev(gemType,position ,temp);
                       // temp=this.checkLShapev(gemType,position + 1,temp);
                        for(var y=position + this.itemByLine;y<this.size  ;y+=this.itemByLine){ 
                            if(this.level[y]!==gemType){ 
                             break;
                        }
                        temp.push(y);
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
                removeFlag=true;
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
                if(this.score>=levelScore)
                {     
                    $('#countdown').countdown360().stop();
                    win();
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
        $('.inset-text-effect').hide();
	var $game = $('#game');
	var $ui = $('#ui');	
        //var bleep = new Audio(); 
       // bleep.src = '../src/candy_crush_soda.mp3';
        //bleep.muted=false;bleep.play();
        bleep.muted=false;bleep.play();
        $('#play').on('click', function(event) {
            bleep.muted=false;
            bleep.play();
        });
        $('#mute').on('click', function(event) {
            bleep.muted=true;
        });
	$('.message button').on('click', function(event) {
		event.preventDefault();
		var value = +$(this).val();
                currentSize=value;
		$('.message').hide();              
		
		newGame = new Game();
		newGame.init(value, $game, $ui);
               
	});

});

function createCountDown(timeRemaining) {
    var startTime = Date.now();
    return function() {
       return timeRemaining - ( Date.now() - startTime );
    }
}
function win(){
//           alert('you win');
        $('#countdown').countdown360().stop();
        $('#game').hide();
        $('#ui').hide();   
        $('#next').show();
       
        $('#tryAgainForm').hide();
        $('#play_again').on('click', function(event) {
            newWindow();

        });
        
        $('#home').on('click', function(event) {
            window.location.href = 'home.html';
        });
        
        $('#next_level').on('click', function(event) {
            if((currentSize+2)<=10){
            //alert("test onclick");
            $('#next').hide();
            var $game = $('#game');
            var $ui = $('#ui');
            $('#game').show();
            $('#ui').show();   
            newGame = new Game();
            newGame.init(currentSize + 2, $game, $ui);
            levelScore *= currentSize / 2;
        }
        else{
             window.location.href = 'home.html';
        }
           // countTime();
        });
};
function countTime(){
      $("#countdown").countdown360({
                        radius      : 60,
                        seconds     : 20,
                                fillStyle: "red",
                                strokeStyle:"yellow",

                        fontColor   : '#FFFFFF',
                        autostart   : false,
                        onComplete  : function () { 
                             if(currentScore<1000){
                                $('#ui').hide();
                                $('#game').hide();
                                $('#next').hide();
                                $('#tryAgainForm').show();
                                $('.try-again').on('click', function(event) {
                                    newWindow();
                                });
                        }else{
                           // alert("win");
                            win();
                        }
                    }
		   }).start();
 }