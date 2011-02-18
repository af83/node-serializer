var serializer = require('./serializer');

var vows = require('vows')
  , assert = require('assert')
;

var VALS = [
  -4
  , 0
  , 42
  , null
  , true
  , false
  , []
  , ["a",2]
  , {}
  , ''
  , 12554322
  , "short str"
  , "Some long string that would take a lot of place !!!!"
  , {name: "Pierre"}
  , {name: "Cécile"}
  , {nested: {structure: ['some', 'öi']}}
  ];

var round_trip = {};
var round_trip_secure = {};
VALS.forEach(function(val) {
  round_trip['round trip with value ' + JSON.stringify(val)] = function() {
    var dump = serializer.stringify(val);
    var original = serializer.parse(dump);
    assert.deepEqual(original, val);
    // Algorithm must be determinist:
    var dump2 = serializer.stringify(val);
    assert.equal(dump, dump2);
  };

  round_trip_secure['round trip with value '+ JSON.stringify(val)] = function() {
    var encrypt_key = 'somesecretkey';
    var validate_key = 'anothersecretstring';
    var res = serializer.secureStringify(val, encrypt_key, validate_key);
    var original = serializer.secureParse(res, encrypt_key, validate_key);
    assert.deepEqual(original, val);
    // The result string must vary between different calls:
    var res2 = serializer.secureStringify(val, encrypt_key, validate_key);
    assert.notEqual(res, res2);
  };

});

var dont_call = function() {
  assert.ok(false, "must no be called");
};

vows.describe('Serializer').addBatch({
  'stringify & parse': round_trip,
  'secureStringify & secureParse': round_trip_secure,
  'createSecureSerializer' : {
    topic: serializer.createSecureSerializer('crypt', 'valid'),

    'round trip': function(ss) {
      var initial = {'hello': 'word'};
      assert.deepEqual(initial, ss.parse(ss.stringify(initial)));
    }
  }
}).export(module); // Export the Suite
