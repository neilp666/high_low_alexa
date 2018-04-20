'use strict';
const Alexa = require("alexa-sdk");
const appId = 'amzn1.ask.skill.7eef6693-a579-4059-88ae-ccb432d5a997';

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = appId;
  alexa.registerHandlers(newSessionHandler,startGameHandlers, guessGameHandlers, guessAttemptHandlers);
  alexa.execute();
};

const states = {
  "STARTMODE": "_STARTMODE",
  "GUESSMODE": "_GUESSMODE"
}

const newSessionHandler = {
  'NewSession': function() {
    const welcomeMessage = 'Welcome to high low. Would you like to play?';
    this.response.speak(welcomeMessage).listen('You can say Yes or No');
    this.handler.state = states.STARTMODE;
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function(){
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  }
};

const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {

  'AMAZON.StopIntent': function(){
    this.response.speak('Goodbye from startmode!');
    this.emit(':responseReady');
  },
  'AMAZON.YesIntent': function() {
    this.attributes["guessnumber"] = Math.floor(Math.random() * 100);
    this.handler.state = states.GUESSMODE;
    this.response.speak('Great. Start by guessing a number').listen("guess a number");
    this.emit(':responseReady');

  },
  'AMAZON.NoIntent': function() {
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  }

});

const guessGameHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
  'NumberGuessIntent': function() {
      const guessNum = parseInt(this.event.request.intent.slots.number.value);
      const targetNum = this.attributes["guessNumber"];
      console.log('user guessed: ' + guessNum);

      if(guessNum > targetNum) {
        this.emit('TooHigh', guessNum);
      } else if(guessNum < targetNum) {
        this.emit('TooLow', guessNum);
      } else if (guessNum ==== targetNum){
        this.emit('JustRight',() => {
          this.response.speak(guessNum.toString() + 'is correct! would you like to play a new game?').listen('Say yes to start a new game, or no to end the game');
          this.emit(':responseReady');
        })
      } else {
        this.emit('NotANum');
      }
  },

  'AMAZON.StopIntent': function(){
    this.response.speak('Goodbye! fro guessmode');
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  }

});

const guessAttemptHandlers = {
  'TooHigh': function(val) {
    this.response.speak(val.toString() + ' is too high.')
    .listen('Try saying a smaller number.');
    this.emit(':responseReady');
  },
  'TooLow': function(val) {
    this.response.speak(val.toString() + ' is too low.')
    .listen('Try saying a larger number.');
    this.emit(':responseReady');
  },
  'JustRight': function(callback) {
    this.handler.state = states.STARTMODE;
    callback();
  },
  'NotANum': function() {
    this.response.speak('Sorry, I didn\'t get that. Try saying a number.').listen('Try saying a number.');
    this.emit(':responseReady');
  }
};
