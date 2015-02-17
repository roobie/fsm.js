/**
 EXAMPLE USAGE:
 **/

var fsm = FSM({ initial: 'green' })
      /// STATE TRANSITION DEFINITIONS
      ///  event name | from_state(s)       | to_state
      .def('warn',      'green',              'yellow')
      .def('panic',     ['green', 'yellow'],  'red')
      .def('clear',     '*',                  'green')
      /// GENERAL EVENT HANDLERS
      .on('transition', function() {
        // handler that is called whenever there's a transition.
      })
      .on('leave:state', function() {
        // handler that is called whenever there's a state is left.
      })
      .on('enter:state', function() {
        // handler that is called whenever there's a state is entered.
      })
      /// STATE TRANSITION EVENT HANDLERS
      .on('warn', function() {
        // fired when the transition 'warn' has completed.
        console.log('warning');

        // returning a promise indicates that this handler is async
        // and FSM will continue only when the promise is resolved
        return new Promise(function(resolve, reject) {
          setTimeout(resolve, 100);
        });
      })
      .on('leave:green', function () {
        // fired when leaving the state 'green'
      })
      .on('enter:red', function () {
        // fired when entering the state 'red'
        return new Promise(function(resolve, reject) {
          // rejecting a promise will cause transition to be canceled
          setTimeout(reject, 100);
        });
      })
;
function FSM(cfg) {
  var WILDCARD = '*';

  var chainable = function chainable_decorator(fn) {
    return function chainable() {
      fn.apply(this, arguments);
      return this;
    };
  };

  var contains = function(list, item) {
    return list.indexOf(item) !== -1;
  };

  var make_handler = function() {
    return function() {

    };
  };

  /// [ PRIVATES
  var current = '',
      /// transition_name => { from_states: Array<String>|String, to_state: String}
      transitions = {},

      /// event_name => Array<Function>
      event_handlers = {};
  /// ]

  function StateMachine(cfg) {
    // init
    current = cfg.initial;
  }

  StateMachine.prototype = {
    def: chainable(function define_transition(transition_name, from_states, to_state) {
      this[transition_name] = make_handler();
      transitions[transition_name] = {
        from_states: from_states,
        to_state: to_state
      };
    }),

    on: chainable(function register_callback(event_name, handler) {
      if (event_handlers[event_name]) {
        event_handlers[event_name].push(handler);
      } else {
        event_handlers[event_name] = [ handler ];
      }
    }),
    off: chainable(function(event_name, handler) {
      var index = event_handlers[event_name].indexOf(handler);
      if (index > -1) {
        event_handlers[event_name].splice(index, 1);
      }
    }),

    is: function(state_name) {
      return current === state_name;
    },
    can: function(transition_name) {
      var from = transitions[transition_name].from_states;
      return from === WILDCARD || contains(from, current);
    },
    cannot: function(transition_name) {
      return !this.can(transition_name);
    },

    // transitions: function() {
    // }
  };

  return new StateMachine(cfg);
};
