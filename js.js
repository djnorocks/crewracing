/*
 * Crewracing - Better Crew List!
 * http://github.com/dtinth/crewracing
 *
 * By Thai Pangsakulyanont (DJ THAI in TECHNIKA2)
 * MIT Licensed
 */
var Crewracing = (function() {
	var modules = {}, require = function(name) { return modules[name](); };
	function m(factory) {
		var initialized = false;
		var module = { exports: {} };
		return function() {
			if (!initialized) {
				factory(require, module.exports, module);
				initialized = true;
			}
			return module.exports;
		};
	}
	return function() {
		for (var i = 0; i < arguments.length; i ++) {
			modules[arguments[i].name] = m(arguments[i].factory);
		}
		require('./main');
		return { require: require };
	};
})()(
{ name: "./main", factory: function(require, exports, module) {
var Application, application, data, hash, ui, utils;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
data = require('./data');
ui = require('./ui');
utils = require('./utils');
hash = require('./hash');
Application = (function() {
  var HashChecker;
  HashChecker = (function() {
    function HashChecker(app) {
      this.app = app;
      hash.onbegin = __bind(function() {
        return this.dirty = false;
      }, this);
      hash.listen('q', __bind(function(v) {
        this.app.searchBox.setValue((v != null ? v : ""));
        return this.dirty = true;
      }, this));
      hash.listen('live', __bind(function(v) {
        this.app.rankMode.select((v ? data.Ranking.LIVE : data.Ranking.MACHINE));
        return this.dirty = true;
      }, this));
      hash.listen('all', __bind(function(v) {
        this.app.showAll.setChecked((v ? true : false));
        return this.dirty = true;
      }, this));
      hash.listen('round', __bind(function(v) {
        v = parseInt(v);
        return this.app.switchRound(((19 <= v && v <= this.app.latestData.db.round) ? v : this.app.latestData.db.round));
      }, this));
      hash.onend = __bind(function() {
        if (this.dirty) {
          return this.app.update();
        }
      }, this);
    }
    return HashChecker;
  })();
  function Application() {
    this.table = new ui.Table;
    this.table.onsort = __bind(function(key) {
      return this.sortBy(key);
    }, this);
    this.showAll = new ui.Checkbox('Show All', document.getElementById('limit'));
    this.showAll.ontoggle = __bind(function() {
      if (this.showAll.checked) {
        hash.set('all', true);
      } else {
        hash.del('all');
      }
      return this.update();
    }, this);
    this.searchBox = new ui.SearchBox;
    this.searchBox.onchange = __bind(function() {
      return this.update();
    }, this);
    this.searchBox.onsave = __bind(function() {
      return hash.set('q', this.searchBox.getValue());
    }, this);
    this.rankMode = this._createRankMode();
    this.rankMode.onselect = __bind(function() {
      if (this.rankMode.getKey() === data.Ranking.LIVE) {
        hash.set('live', true);
      } else {
        hash.del('live');
      }
      return this.update();
    }, this);
    this.updatedText = document.getElementById('updated-text');
    this.query = new data.Query;
    this.hashChecker = new HashChecker(this);
  }
  Application.prototype._createRankMode = function() {
    var o, options;
    o = function(key, value, disp) {
      return new ui.DropDown.Option(key, value, disp);
    };
    options = [o(data.Ranking.LIVE, 'Live Ranking', 'Live'), o(data.Ranking.MACHINE, 'Machine Ranking', 'Machine')];
    return new ui.DropDown(options, data.Ranking.MACHINE, 'Ranking Mode', document.getElementById('mode-switch'));
  };
  Application.prototype.sortBy = function(key) {
    this.query.sortBy(key);
    return this.update();
  };
  Application.prototype.load = function(json) {
    this.data = new data.Database(json);
    return this.loadData();
  };
  Application.prototype.loadData = function() {
    if (this.roundSwitch == null) {
      this.latestData = this.data;
      this.roundSwitch = this._createRoundSwitch();
      this.roundSwitch.onvalidate = __bind(function(opt, cont) {
        var round;
        round = parseInt(opt.key);
        if (round === this.latestData.db.round) {
          hash.del('round');
        } else {
          hash.set('round', round);
        }
        return this.switchRound(round, cont);
      }, this);
      hash.start();
    }
    this.roundSwitch.select(this.data.db.round);
    if (this.switchRound.cont) {
      this.switchRound.cont(true);
      delete this.switchRound.cont;
    }
    this.updatedText.innerHTML = this.data.db.updated;
    return this.update();
  };
  Application.prototype.switchRound = function(round, cont) {
    var js;
    if (this.switchRound.cont) {
      cont(false);
    }
    this.switchRound.cont = cont;
    if (round !== this.latestData.db.round) {
      js = document.createElement('script');
      js.src = "http://tnk.dt.in.th/tnk2/archives/round" + round + ".js";
      js.type = 'text/javascript';
      return document.body.appendChild(js);
    } else {
      this.data = this.latestData;
      return this.loadData();
    }
  };
  Application.prototype._createRoundSwitch = function() {
    var o, options, round, _ref;
    o = function(key, value, disp) {
      return new ui.DropDown.Option(key, value, disp);
    };
    options = [];
    for (round = 19, _ref = this.data.db.round; 19 <= _ref ? round <= _ref : round >= _ref; 19 <= _ref ? round++ : round--) {
      options.push(o(round, "" + (utils.th(round)) + " Crew Race Round", "<span class='round'>Round " + round + "</span>" + (round === this.latestData.db.round ? " (Current)" : " (Archive)")));
    }
    return new ui.DropDown(options, this.data.db.round, '', document.getElementById('round-switch'));
  };
  Application.prototype.update = function() {
    var results;
    this.query.limit = (this.showAll.checked ? Infinity : 90);
    this.query.search = this.searchBox.getValue();
    this.query.mode = this.rankMode.getKey();
    results = this.data.query(this.query);
    return this.table.update(this.query, results);
  };
  return Application;
})();
application = null;
window.gotData = function(json) {
  if (application === null) {
    application = new Application;
  }
  return application.load(json);
};
} },
{ name: "./ui", factory: function(require, exports, module) {
var Checkbox, DropDown, SearchBox, State, Table, createLink, data, storage, utils;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
utils = require('./utils');
data = require('./data');
storage = require('./storage');
createLink = function() {
  var el;
  el = document.createElement('a');
  el.href = 'javascript://crewracing/';
  return el;
};
State = (function() {
  function State(element, base) {
    this.element = element;
    this.base = base;
    this.hash = {};
  }
  State.prototype.set = function(name) {
    this.hash[name] = true;
    return this.update();
  };
  State.prototype.unset = function(name) {
    delete this.hash[name];
    return this.update();
  };
  State.prototype.update = function() {
    var key;
    return this.element.className = this.base + ' ' + ((function() {
      var _results;
      _results = [];
      for (key in this.hash) {
        _results.push(key);
      }
      return _results;
    }).call(this)).join(' ');
  };
  return State;
})();
exports.DropDown = DropDown = (function() {
  var DropdownOption, Option, showing;
  showing = null;
  DropDown.Option = Option = Option = (function() {
    function Option(key, text, displayedText) {
      var _ref;
      this.key = key;
      this.text = text;
      this.displayedText = displayedText;
            if ((_ref = this.displayedText) != null) {
        _ref;
      } else {
        this.displayedText = this.text;
      };
    }
    return Option;
  })();
  DropdownOption = (function() {
    function DropdownOption(dropdown, option) {
      this.dropdown = dropdown;
      this.option = option;
      this.selected = false;
      this.element = document.createElement('li');
      this.text = createLink();
      this.text.innerHTML = this.option.text;
      this.text.onclick = __bind(function() {
        return this.dropdown.userSelect(this);
      }, this);
      this.element.appendChild(this.text);
      this.update();
      this.dropdown.list.appendChild(this.element);
    }
    DropdownOption.prototype.select = function() {
      this.selected = true;
      return this.update();
    };
    DropdownOption.prototype.deselect = function() {
      this.selected = false;
      return this.update();
    };
    DropdownOption.prototype.update = function() {
      return this.element.className = (this.selected ? 'selected' : '');
    };
    return DropdownOption;
  })();
  function DropDown(options, defaultOption, label, container) {
    var labelElement, option, _i, _len, _ref;
    this.options = options;
    this.container = container;
    this.element = document.createElement('div');
    this.state = new State(this.element, 'dropdown');
    this.activator = createLink();
    this.activator.className = 'dropdown-activator';
    if (label !== "") {
      labelElement = document.createElement('span');
      labelElement.className = 'label';
      labelElement.innerHTML = label + ': ';
      this.activator.appendChild(labelElement);
    }
    this.selectedOptionContainer = document.createElement('span');
    this.selectedOptionContainer.className = 'sel-opt';
    this.selectedOptionIndicator = document.createElement('span');
    this.selectedOptionIndicator.className = 'text';
    this.selectedOptionContainer.appendChild(this.selectedOptionIndicator);
    this.activator.appendChild(this.selectedOptionContainer);
    this.list = document.createElement('ul');
    this.list.className = 'dropdown-list';
    this.map = {};
    _ref = this.options;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      this.map[option.key] = new DropdownOption(this, option);
    }
    this.select(this.map[defaultOption]);
    this.element.appendChild(this.activator);
    this.element.appendChild(this.list);
    this.container.appendChild(this.element);
    this.delay = 0;
    this.element.onmouseover = __bind(function() {
      return this.open();
    }, this);
    this.element.onmouseout = __bind(function() {
      return this.delayedClose();
    }, this);
    this.activator.onfocus = __bind(function() {
      return this.open();
    }, this);
    this.activator.onclick = __bind(function() {
      this.open();
      return this.onclick();
    }, this);
    this.close();
  }
  DropDown.prototype.delayedClose = function() {
    clearTimeout(this.delay);
    return this.delay = setTimeout((__bind(function() {
      return this.close();
    }, this)), 180);
  };
  DropDown.prototype.open = function() {
    clearTimeout(this.delay);
    if (showing !== this) {
      if (showing !== null) {
        showing.close();
      }
    }
    showing = this;
    return this.state.set('dropdown-open');
  };
  DropDown.prototype.close = function() {
    clearTimeout(this.delay);
    return this.state.unset('dropdown-open');
  };
  DropDown.prototype.onclick = function() {};
  DropDown.prototype.onvalidate = function(opt, cont) {
    return cont(true);
  };
  DropDown.prototype.onselect = function() {};
  DropDown.prototype.getKey = function() {
    return this.selectedOption.option.key;
  };
  DropDown.prototype.userSelect = function(d) {
    var state;
    if (d === this.selectedOption) {
      this.delayedClose();
      return;
    }
    state = 0;
    this.onvalidate(d.option, __bind(function(valid) {
      if (state === 1) {
        this.state.unset('dropdown-working');
      }
      state = 2;
      if (valid) {
        this.select(d);
        this.onselect();
      }
      return this.delayedClose();
    }, this));
    if (state === 0) {
      state = 1;
      return this.state.set('dropdown-working');
    }
  };
  DropDown.prototype.select = function(d) {
    if (d instanceof Option) {
      d = this.map[d.key];
    } else if (!(d instanceof DropdownOption)) {
      d = this.map[d];
    }
    if (!(d instanceof DropdownOption)) {
      return false;
    }
    if (this.selectedOption != null) {
      this.selectedOption.deselect();
    }
    this.selectedOption = d;
    this.selectedOption.select();
    return this.selectedOptionIndicator.innerHTML = this.selectedOption.option.displayedText;
  };
  return DropDown;
})();
exports.SearchBox = SearchBox = (function() {
  function SearchBox() {
    this.element = document.getElementById('search');
    this.element.onkeyup = __bind(function(e) {
            if (e != null) {
        e;
      } else {
        e = event;
      };
      if (e.keyCode === 13) {
        this.save();
      }
      return this.change();
    }, this);
    this.element.onchange = __bind(function() {
      this.change();
      return this.save();
    }, this);
  }
  SearchBox.prototype.getValue = function() {
    return this.element.value;
  };
  SearchBox.prototype.setValue = function(v) {
    return this.element.value = v;
  };
  SearchBox.prototype.change = function() {
    return this.onchange();
  };
  SearchBox.prototype.save = function() {
    return this.onsave();
  };
  return SearchBox;
})();
exports.Checkbox = Checkbox = (function() {
  function Checkbox(label, container) {
    this.container = container;
    this.checked = false;
    this.element = createLink();
    this.element.innerHTML = label;
    this.element.onclick = __bind(function() {
      return this.clicked();
    }, this);
    this.updateClassName();
    this.container.appendChild(this.element);
  }
  Checkbox.prototype.getClassName = function() {
    return "checkbox checkbox-" + (this.checked ? "checked" : "unchecked");
  };
  Checkbox.prototype.updateClassName = function() {
    return this.element.className = this.getClassName();
  };
  Checkbox.prototype.clicked = function() {
    this.checked = !this.checked;
    this.updateClassName();
    this.ontoggle();
    return false;
  };
  Checkbox.prototype.setChecked = function(checked) {
    this.checked = checked;
    return this.updateClassName();
  };
  return Checkbox;
})();
exports.Table = Table = (function() {
  function Table() {
    this.element = document.getElementById('main');
    this.element.onclick = __bind(function(e) {
      var target, uid;
            if (e != null) {
        e;
      } else {
        e = event;
      };
      target = e.target;
            if (target != null) {
        target;
      } else {
        target = e.srcElement;
      };
      if ((target.getAttribute('data-sort')) != null) {
        return this.onsort(target.getAttribute('data-sort'));
      } else if ((target.getAttribute('data-crew-toggle')) != null) {
        uid = target.getAttribute('data-crew-toggle');
        storage.setFlag(uid, 'cleared', !storage.checkFlag(uid, 'cleared'));
        return target.parentNode.className = this.renderCrewClassNameUid(uid);
      }
    }, this);
  }
  Table.prototype.update = function(query, results) {
    return this.element.innerHTML = this.render(query, results);
  };
  Table.prototype.render = function(query, results) {
    return "<table cellspacing=\"0\" class=\"crew-list\">\n	" + (this.renderHeaders(query)) + "\n	" + (this.renderCrews(query, results)) + "\n</table>";
  };
  Table.prototype.renderHeaders = function(query) {
    return "<tr>\n	<th onclick=\"return true;\" data-sort=\"rank\" class=\"" + (this.renderSortClass(query, 'rank')) + "\">Rank</th>\n	<th onclick=\"return true;\" data-sort=\"name\" class=\"" + (this.renderSortClass(query, 'name')) + "\" colspan=\"2\">Name</th>\n	<th onclick=\"return true;\" data-sort=\"stage1\" class=\"" + (this.renderSortClass(query, 'stage1')) + "\">Stage 1</th>\n	<th onclick=\"return true;\" data-sort=\"stage2\" class=\"" + (this.renderSortClass(query, 'stage2')) + "\">Stage 2</th>\n	<th onclick=\"return true;\" data-sort=\"stage3\" class=\"" + (this.renderSortClass(query, 'stage3')) + "\">Stage 3</th>\n	<th>Course</th>\n	<th onclick=\"return true;\" data-sort=\"winrate\" class=\"" + (this.renderSortClass(query, 'winrate')) + " last\">Win Rate</th>\n</tr>";
  };
  Table.prototype.renderSortClass = function(query, k) {
    if (query.sort === k) {
      if (query.direction >= 0) {
        return "sort-ascending";
      } else {
        return "sort-descending";
      }
    } else {
      return "sort-none";
    }
  };
  Table.prototype.renderCrews = function(query, crews) {
    var crew;
    if (crews.length === 0) {
      return "<tr class=\"no-matches\">\n	<td colspan=\"8\">No matches!</td>\n</tr>";
    } else {
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = crews.length; _i < _len; _i++) {
          crew = crews[_i];
          _results.push(this.renderCrew(query, crew));
        }
        return _results;
      }).call(this)).join("\n");
    }
  };
  Table.prototype.renderCrew = function(query, crew) {
    return "<tr class=\"" + (this.renderCrewClassName(crew)) + "\">\n	<td title=\"Mark/unmark as cleared.\" class=\"rank\" data-crew-toggle=\"" + crew.uid + "\" onclick=\"return true;\">" + crew.displayedRank + ".</td>\n	<td class=\"emblem\">" + (this.renderEmblem(crew)) + "</td>\n	<td class=\"name\">\n		<span class=\"crew-name\">" + crew.name + "</span>\n		<span class=\"crew-points\">" + crew.points + " pts" + (this.renderAdditionalRanking(query, crew)) + "</span>\n	</td>\n	" + (this.renderCourse(crew.course)) + "\n</tr>";
  };
  Table.prototype.renderCrewClassName = function(crew) {
    return this.renderCrewClassNameUid(crew.uid);
  };
  Table.prototype.renderCrewClassNameUid = function(uid) {
    return "crew" + (storage.checkFlag(uid, 'cleared') ? " crew-cleared" : "");
  };
  Table.prototype.renderAdditionalRanking = function(query, crew) {
    if (query.mode === data.Ranking.LIVE) {
      return "";
    }
    return " (" + (utils.th(crew.rank)) + ")";
  };
  Table.prototype.renderEmblem = function(crew) {
    return "<img\n	src=\"http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/pattern/" + crew.emblemPattern.id + ".png\"\n	style=\"background:url(http://images.djmaxcrew.com/Technika2/EN/icon/technika2/emblem/plate/" + crew.emblemPlate.id + ".png\"\n	width=\"30\" height=\"30\">";
  };
  Table.prototype.renderCourse = function(course) {
    if (!(course != null)) {
      return "<td colspan=\"5\" class=\"no-course\">(No Course)</td>";
    }
    return "<td class=\"song\">" + (this.renderStageSong(course.stages[0])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[1])) + "</td>\n<td class=\"song\">" + (this.renderStageSong(course.stages[2])) + "</td>\n<td class=\"course-info\">\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[0])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[1])) + "</span>\n	<span class=\"song-line\">" + (this.renderStageInfo(course.stages[2])) + "</span>\n</td>\n<td class=\"win-info\">\n	<span class=\"percentage\">" + (this.renderCoursePercentage(course)) + "</span>\n	<span class=\"details\">" + (this.renderWinRateDetails(course)) + "</span>\n	<span title=\"Producer\" class=\"producer\">" + course.producer + "</span>\n</td>";
  };
  Table.prototype.renderCoursePercentage = function(course) {
    if (course.crew.machineRank > 90 && course.plays === 0) {
      return "<span class=\"na-unranked\">&times;</span>";
    } else if (course.plays === 0) {
      return "<span class=\"na-noplays\">&mdash;</span>";
    } else {
      return "" + (Math.round(course.wins / course.plays * 100)) + "%";
    }
  };
  Table.prototype.renderWinRateDetails = function(course) {
    if (course.crew.machineRank > 90 && course.plays === 0) {
      return "Unranked";
    } else if (course.plays === 0) {
      return "No plays";
    } else {
      return "" + course.wins + " / " + course.plays;
    }
  };
  Table.prototype.renderStageSong = function(stage) {
    return "<img src=\"http://images.djmaxcrew.com/Technika2/EN/icon/technika2/disc_s/" + stage.pattern.id + ".png\">\n<span class=\"effectors\">\n	" + (this.renderEffector(stage.effects.fade)) + "\n	" + (this.renderEffector(stage.effects.line)) + "\n	" + (this.renderEffector(stage.effects.scroll)) + "\n</span>";
  };
  Table.prototype.renderEffector = function(fx) {
    return fx;
  };
  Table.prototype.renderStageInfo = function(stage) {
    var lv;
    lv = stage.pattern.levelName;
    if (stage.pattern.info && stage.pattern.info.level) {
      lv = "<span title=\"Lv." + stage.pattern.info.level + "\">" + lv + "</span>";
    }
    return "<span class=\"song-name\">" + stage.pattern.song.title + "</span> <span class=\"song-pattern p" + stage.pattern.level + "\">" + lv + "</span>";
  };
  return Table;
})();
} },
{ name: "./data", factory: function(require, exports, module) {
var Database, Filter, Query, Ranking, Trie, sorters, utils;
utils = require('./utils');
Trie = (function() {
  function Trie() {
    this.data = {};
    this.crews = {};
  }
  Trie.prototype.allocate = function(id) {
    if (!(id in this.data)) {
      this.data[id] = new Trie;
    }
    return this.data[id];
  };
  Trie.prototype.get = function(id) {
    if (id in this.data) {
      return this.data[id];
    }
    return null;
  };
  Trie.prototype.add = function(crew) {
    return this.crews[crew.id] = crew;
  };
  return Trie;
})();
Filter = (function() {
  function Filter() {
    this.root = new Trie;
    this._lastMask = null;
    this._lastQuery = null;
    this._lastResult = null;
  }
  Filter.prototype.index = function(crew, keywords) {
    keywords = keywords.toLowerCase();
    this.addMatches(crew, keywords.match(/\S+/g));
    return this.addMatches(crew, keywords.match(/\w+/g));
  };
  Filter.prototype.addMatches = function(crew, matches) {
    var match, _i, _len, _results;
    if (matches) {
      _results = [];
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        match = matches[_i];
        _results.push(this.access(match).add(crew));
      }
      return _results;
    }
  };
  Filter.prototype.access = function(word) {
    var i, node, _ref;
    node = this.root;
    for (i = 0, _ref = word.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      node = node.allocate(word.charAt(i));
    }
    return node;
  };
  Filter.prototype.find = function(word) {
    var i, node, _ref;
    node = this.root;
    for (i = 0, _ref = word.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      node = node.get(word.charAt(i));
      if (node === null) {
        break;
      }
    }
    return node;
  };
  Filter.prototype.search = function(mask, query) {
    var crew, id, matches, results, walk, word, _i, _len, _results;
    if (mask === this._lastMask && query === this._lastQuery) {
      return this._lastResult;
    }
    results = mask;
    matches = query.toLowerCase().match(/\S+/g);
    if (matches) {
      walk = function(tree) {
        var crew, key, _ref, _results;
        if (!tree) {
          return;
        }
        _ref = tree.crews;
        for (key in _ref) {
          crew = _ref[key];
          if (crew.id in mask) {
            results[crew.id] = crew;
          }
        }
        _results = [];
        for (key in tree.data) {
          _results.push(walk(tree.data[key]));
        }
        return _results;
      };
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        word = matches[_i];
        mask = results;
        results = {};
        walk(this.find(word));
      }
    }
    _results = [];
    for (id in results) {
      crew = results[id];
      _results.push(crew);
    }
    return _results;
  };
  return Filter;
})();
exports.Ranking = Ranking = {
  MACHINE: 1,
  LIVE: 2
};
exports.Query = Query = (function() {
  function Query() {
    this.mode = Ranking.MACHINE;
    this.search = '';
    this.sort = 'rank';
    this.direction = 1;
    this.limit = 90;
  }
  Query.prototype.sortBy = function(key) {
    if (key === this.sort) {
      return this.direction *= -1;
    } else {
      this.sort = key;
      return this.direction = 1;
    }
  };
  return Query;
})();
sorters = (function() {
  var cmp, compare, namecompare, rankcompare, require, requirecourse, stagecompare, winratecompare;
  cmp = function(a, b, cont) {
    if (cont == null) {
      cont = function() {
        return 0;
      };
    }
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return cont();
    }
  };
  compare = function(func) {
    return function(a, b, cont) {
      return cmp(func.call(a), func.call(b), cont);
    };
  };
  require = function(func) {
    return function(a, b, cont) {
      var ares, bres;
      ares = func.call(a);
      bres = func.call(b);
      if (!ares && !bres) {
        return 0;
      }
      if (!ares) {
        return 1;
      }
      if (!bres) {
        return -1;
      }
      return cont();
    };
  };
  rankcompare = function(a, b) {
    return compare(function() {
      return this.displayedRank;
    })(a, b);
  };
  namecompare = function(a, b) {
    return compare(function() {
      return this.name.toLowerCase();
    })(a, b);
  };
  requirecourse = function(a, b, cont) {
    return require(function() {
      return this.course != null;
    })(a, b, function() {
      return cont();
    });
  };
  stagecompare = function(num) {
    return function(a, b) {
      return requirecourse(a, b, function() {
        return compare(function() {
          return this.course.stages[num].pattern.song.title;
        })(a, b, function() {
          return compare(function() {
            return this.course.stages[num].pattern.id;
          })(a, b, function() {
            return namecompare(a, b);
          });
        });
      });
    };
  };
  winratecompare = function(a, b) {
    return requirecourse(a, b, function() {
      return require(function() {
        return this.course.plays > 0;
      })(a, b, function() {
        return compare(function() {
          return -1 * this.course.wins / this.course.plays;
        })(a, b, function() {
          return compare(function() {
            return -1 * this.course.plays;
          })(a, b, function() {
            return rankcompare(a, b);
          });
        });
      });
    });
  };
  return {
    rank: rankcompare,
    name: namecompare,
    stage1: stagecompare(0),
    stage2: stagecompare(1),
    stage3: stagecompare(2),
    winrate: winratecompare
  };
})();
exports.canSortBy = function(key) {
  return sorters.hasOwnProperty(key);
};
exports.Database = Database = (function() {
  var db;
  db = require('./db');
  function Database(json) {
    this.db = new db.DB(json);
    this._calculateMachineRanking();
    this.initialMasks = this._createInitialMasks();
    this.filter = this._createFilter();
  }
  Database.prototype._calculateMachineRanking = function() {
    var crew, crews, id, nextRank, _i, _len, _results;
    crews = (function() {
      var _ref, _results;
      _ref = this.db.crews;
      _results = [];
      for (id in _ref) {
        crew = _ref[id];
        if (crew.course) {
          _results.push(crew);
        }
      }
      return _results;
    }).call(this);
    crews.sort(function(a, b) {
      var i, _ref;
      for (i = 0, _ref = Math.max(a.previousRanks.length, b.previousRanks.length); 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        if (a.previousRanks[i] === 0 || !(a.previousRanks[i] != null)) {
          return 1;
        }
        if (b.previousRanks[i] === 0 || !(b.previousRanks[i] != null)) {
          return -1;
        }
        if (a.previousRanks[i] !== b.previousRanks[i]) {
          return a.previousRanks[i] - b.previousRanks[i];
        }
      }
      return 0;
    });
    nextRank = 1;
    _results = [];
    for (_i = 0, _len = crews.length; _i < _len; _i++) {
      crew = crews[_i];
      _results.push(crew.machineRank = nextRank++);
    }
    return _results;
  };
  Database.prototype._createInitialMasks = function() {
    var masks, that;
    that = this;
    masks = {};
    masks[Ranking.MACHINE] = utils.createMask(function() {
      var crew, id, _ref;
      _ref = that.db.crews;
      for (id in _ref) {
        crew = _ref[id];
        if (crew.course) {
          this(crew);
        }
      }
    });
    masks[Ranking.LIVE] = utils.createMask(function() {
      var crew, id, _ref;
      _ref = that.db.crews;
      for (id in _ref) {
        crew = _ref[id];
        this(crew);
      }
    });
    return masks;
  };
  Database.prototype._createFilter = function() {
    var crew, filter, id, stage, _i, _len, _ref, _ref2;
    filter = new Filter;
    _ref = this.db.crews;
    for (id in _ref) {
      crew = _ref[id];
      filter.index(crew, crew.name);
      if (crew.course != null) {
        filter.index(crew, crew.course.producer);
        _ref2 = crew.course.stages;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          stage = _ref2[_i];
          filter.index(crew, stage.pattern.title);
          if (stage.pattern.song.info) {
            filter.index(crew, stage.pattern.song.info.title);
          }
        }
      }
    }
    return filter;
  };
  Database.prototype.query = function(q) {
    var crew, results, _i, _len;
    results = (function() {
      var _i, _len, _ref, _results;
      _ref = this.filter.search(this.initialMasks[q.mode], q.search);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        crew = _ref[_i];
        _results.push(crew);
      }
      return _results;
    }).call(this);
    for (_i = 0, _len = results.length; _i < _len; _i++) {
      crew = results[_i];
      crew.displayedRank = this._getDisplayedRank(crew, q);
    }
    results = (function() {
      var _j, _len2, _results;
      _results = [];
      for (_j = 0, _len2 = results.length; _j < _len2; _j++) {
        crew = results[_j];
        if (crew.displayedRank <= q.limit) {
          _results.push(crew);
        }
      }
      return _results;
    })();
    results.sort(function(a, b) {
      return sorters[q.sort](a, b) * q.direction;
    });
    return results;
  };
  Database.prototype._getDisplayedRank = function(crew, q) {
    if (q.mode === Ranking.MACHINE) {
      return crew.machineRank;
    } else {
      return crew.rank;
    }
  };
  return Database;
})();
} },
{ name: "./db", factory: function(require, exports, module) {
var DB;
exports.DB = DB = (function() {
  var Crew;
  Crew = (function() {
    var Course;
    Course = (function() {
      var songdb;
      songdb = require('./songdb');
      function Course(crew, json) {
        var key, stage, value, _i, _len, _ref;
        this.crew = crew;
        for (key in json) {
          value = json[key];
          this[key] = value;
        }
        _ref = this.stages;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          stage = _ref[_i];
          stage.pattern = songdb.pattern(stage.pattern);
        }
      }
      return Course;
    })();
    function Crew(db, id, json) {
      var key, value;
      this.db = db;
      this.id = id;
      for (key in json) {
        value = json[key];
        this[key] = value;
      }
      if (this.course) {
        this.course = new Course(this, json.course);
      }
      this.uid = "cr-week" + this.db.round + "-crew" + (escape(this.name));
    }
    return Crew;
  })();
  function DB(json) {
    var crew, id, _len, _ref;
    this.updated = new Date(1000 * json.updated);
    this.round = json.round;
    this.crews = {};
    this.db = {};
    _ref = json.crews;
    for (id = 0, _len = _ref.length; id < _len; id++) {
      crew = _ref[id];
      this.crews[id] = new Crew(this, id, crew);
    }
  }
  return DB;
})();
} },
{ name: "./songdb", factory: function(require, exports, module) {
var Pattern, Song, info, patterns, songs;
info = (function() {
  var chart, db, map, music, _i, _j, _len, _len2, _ref;
  db = require('./music-db');
  map = {
    song: {},
    pattern: {}
  };
  for (_i = 0, _len = db.length; _i < _len; _i++) {
    music = db[_i];
    map.song[music.id] = music;
    _ref = music.charts;
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      chart = _ref[_j];
      map.pattern[music.id + '_' + chart.difficulty] = chart;
    }
  }
  return map;
})();
Song = (function() {
  function Song(id) {
    this.id = id;
    this.info = info.song[this.id];
    if (this.info) {
      if (this.info.short) {
        this.title = this.info.short;
      } else {
        this.title = this.info.title;
      }
    } else {
      this.title = (this.id + '').replace(/^./, function(x) {
        return x.toUpperCase();
      });
    }
  }
  return Song;
})();
Pattern = (function() {
  var levelmap;
  levelmap = {
    '1': 'NM',
    '2': 'HD',
    '3': 'MX'
  };
  function Pattern(id) {
    this.id = id;
    this.info = info.pattern[this.id];
    this.song = exports.song(this.id.replace(/_\d$/, ''));
    this.level = parseInt(this.id.charAt(this.id.length - 1));
    this.levelName = levelmap[this.level];
    this.title = this.song.title + ' ' + this.levelName;
  }
  return Pattern;
})();
songs = {};
patterns = {};
exports.song = function(id) {
  if (!(id in songs)) {
    songs[id] = new Song(id);
  }
  return songs[id];
};
exports.pattern = function(id) {
  if (!(id in patterns)) {
    patterns[id] = new Pattern(id);
  }
  return patterns[id];
};
} },
{ name: "./utils", factory: function(require, exports, module) {
exports.th = function(num) {
  var _ref;
  if ((11 <= (_ref = num % 100) && _ref <= 19)) {
    return num + '<sup>th</sup>';
  } else if (num % 10 === 1) {
    return num + '<sup>st</sup>';
  } else if (num % 10 === 2) {
    return num + '<sup>nd</sup>';
  } else if (num % 10 === 3) {
    return num + '<sup>rd</sup>';
  } else {
    return num + '<sup>th</sup>';
  }
};
exports.createMask = function(cont) {
  var obj;
  obj = {};
  cont.call(function(o) {
    return obj[o.id] = o;
  });
  return obj;
};
} },
{ name: "./hash", factory: function(require, exports, module) {
var HashChecker;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
HashChecker = (function() {
  var HashListener;
  HashListener = (function() {
    function HashListener(main, name, onchange) {
      this.main = main;
      this.name = name;
      this.onchange = onchange;
      this.value = null;
    }
    HashListener.prototype.check = function() {
      var v;
      v = this.get();
      if (v === this.value) {
        return;
      }
      this.value = v;
      return this.onchange(this.value);
    };
    HashListener.prototype.get = function() {
      return this.main.get(this.name);
    };
    HashListener.prototype.set = function(v) {
      return this.main.set(this.name, v);
    };
    HashListener.prototype.del = function() {
      return this.main.del(this.name);
    };
    return HashListener;
  })();
  function HashChecker() {
    this.initialized = false;
    this.listeners = {};
  }
  HashChecker.prototype.start = function() {
    if (this.initialized) {
      return;
    }
    this.hash = '';
    this.hashObj = {};
    if ("onhashchange" in window) {
      window.onhashchange = __bind(function() {
        return setTimeout((__bind(function() {
          return this.checkHash();
        }, this)), 1);
      }, this);
    } else {
      setInterval((__bind(function() {
        return this.checkHash();
      }, this)), 500);
    }
    setTimeout((__bind(function() {
      return this.checkHash();
    }, this)), 100);
    return this.initialized = true;
  };
  HashChecker.prototype.listen = function(name, listener) {
    return this.listeners[name] = new HashListener(this, name, listener);
  };
  HashChecker.prototype.get = function(name) {
    return this.hashObj[name];
  };
  HashChecker.prototype.set = function(name, value) {
    this.hashObj[name] = value;
    if (this.listeners[name]) {
      this.listeners[name].value = value;
    }
    return this.update();
  };
  HashChecker.prototype.del = function(name) {
    delete this.hashObj[name];
    if (this.listeners[name]) {
      this.listeners[name].value = void 0;
    }
    return this.update();
  };
  HashChecker.prototype.update = function() {
    var name, value;
    return location.hash = this.hash = '#' + ((function() {
      var _ref, _results;
      _ref = this.hashObj;
      _results = [];
      for (name in _ref) {
        value = _ref[name];
        _results.push(encodeURIComponent(name) + (value === true ? "" : "=" + encodeURIComponent(value)));
      }
      return _results;
    }).call(this)).join('&');
  };
  HashChecker.prototype.checkHash = function() {
    var key, listener, pair, position, value, _i, _len, _ref, _ref2;
    if (location.hash === this.hash) {
      return;
    }
    this.hash = location.hash;
    this.hashObj = {};
    _ref = this.hash.replace(/^#/, '').split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pair = _ref[_i];
      if (pair === '') {
        continue;
      }
      key = pair;
      value = true;
      position = pair.indexOf('=');
      if (position > -1) {
        key = pair.substr(0, position);
        value = decodeURIComponent(pair.substr(position + 1));
      }
      key = decodeURIComponent(key);
      if (key === '') {
        continue;
      }
      this.hashObj[key] = value;
    }
    this.onbegin();
    _ref2 = this.listeners;
    for (key in _ref2) {
      listener = _ref2[key];
      listener.check();
    }
    return this.onend();
  };
  HashChecker.prototype.onbegin = function() {};
  HashChecker.prototype.onend = function() {};
  return HashChecker;
})();
module.exports = new HashChecker;
} },
{ name: "./storage", factory: function(require, exports, module) {
var id;
id = function(uid, key) {
  return "" + uid + "-" + key;
};
exports.checkFlag = function(uid, key) {
  if (typeof localStorage !== "undefined" && localStorage !== null) {
    if (localStorage.getItem != null) {
      return localStorage.getItem(id(uid, key)) === 'yes';
    }
  }
  return false;
};
exports.setFlag = function(uid, key, y) {
  if (y) {
    return localStorage.setItem(id(uid, key), 'yes');
  } else {
    return localStorage.removeItem(id(uid, key));
  }
};
} },
{ name: "./music-db", factory: function(require, exports, module) {
module.exports=[{"id":"@gobaek1","title":"Proposed, Flower, Wolf Part 1","short":"PFW1","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"4"}]},{"id":"@gobaek2","title":"Proposed, Flower, Wolf Part 2","short":"PFW2","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"@naege","title":"Come to Me","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"8"}]},{"id":"@ner","title":"To You","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"7"}]},{"id":"ai","title":"A.I","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"access","title":"ACCESS","charts":[{"difficulty":"1","level":"2"},{"difficulty":"2","level":"3"},{"difficulty":"3","level":"6"}]},{"id":"area7","title":"Area 7","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"blythe","title":"BlythE","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"9"}]},{"id":"cherokee","title":"Cherokee","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"closer","title":"Closer","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"5"}]},{"id":"coastaltempo","title":"Coastal Tempo","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"color","title":"Color","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"coloursof","title":"Colours of Sorrow","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"creator","title":"Creator","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"}]},{"id":"dearmylady","title":"Dear My Lady","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"divineservice","title":"Divine Service","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"6"}]},{"id":"electronics","title":"Electronics","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"}]},{"id":"endofthemoon","title":"End of the Moonlight","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"enemystorm","title":"Enemy Storm","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"9"}]},{"id":"fate","title":"Fate","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"6"}]},{"id":"fermion","title":"Fermion","charts":[{"difficulty":"1","level":"8"},{"difficulty":"2","level":"10"}]},{"id":"firstkiss","title":"First Kiss","charts":[{"difficulty":"1","level":"2"},{"difficulty":"2","level":"4"},{"difficulty":"3","level":"5"}]},{"id":"flea","title":"Flea","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"freedom","title":"Freedom","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"6"}]},{"id":"fury","title":"Fury","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"hereinthe","title":"Here in the Moment","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"}]},{"id":"hexad","title":"HEXAD","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"honeymoon","title":"Honeymoon","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"4"},{"difficulty":"3","level":"8"}]},{"id":"iwantyou","title":"I Want You","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"inmyheart","title":"In My Heart","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"4"},{"difficulty":"3","level":"5"}]},{"id":"jupiter","title":"Jupiter Driving","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"keystothe","title":"Keys to the World","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"ladymade","title":"Ladymade Star","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"6"}]},{"id":"landscape","title":"Landscape","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"9"}]},{"id":"lovemode","title":"Love Mode","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"lover","title":"Lover","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"melody","title":"Melody","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"8"}]},{"id":"miles","title":"Miles","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"oblivion","title":"OblivioN","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"8"}]},{"id":"pdm","title":"PDM","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"8"}]},{"id":"playthefuture","title":"Play The Future","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"7"}]},{"id":"remember","title":"Remember","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"shoreline","title":"Shoreline","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"sin","title":"SIN","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"},{"difficulty":"3","level":"9"}]},{"id":"sonof","title":"SON OF SUN","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"},{"difficulty":"3","level":"10"}]},{"id":"stop","title":"STOP","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"supersonic","title":"SuperSonic","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"7"}]},{"id":"sweetshining","title":"Sweet Shining Shooting Star","short":"SSSS","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"theclear","title":"The Clear Blue Sky","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"thelastdance","title":"The Last Dance","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"7"}]},{"id":"voyage","title":"Voyage","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"}]},{"id":"whiteblue","title":"White Blue","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"y","title":"Y","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"yourown","title":"Your Own Miracle","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"8"}]},{"id":"@baramege","title":"Ask to Wind","charts":[{"difficulty":"1","level":"1"},{"difficulty":"2","level":"5"}]},{"id":"@baramegelive","title":"Ask to Wind -Live version-","short":"Ask to Wind -Live-","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"}]},{"id":"someday","title":"Someday","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"7"}]},{"id":"brandnewdays","title":"Brand NEW Days","charts":[{"difficulty":"1","level":"2"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"@piano","title":"Piano Concerto No.1","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"},{"difficulty":"3","level":"9"}]},{"id":"eternalmemory","title":"Eternal Memory","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"7"}]},{"id":"rayof","title":"Ray of Illuminati","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"spaceofsoul","title":"Space of Soul","charts":[{"difficulty":"1","level":"8"},{"difficulty":"2","level":"9"}]},{"id":"heartofwitch","title":"Heart of Witch","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"dualstrikers","title":"Dual Strikers","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"}]},{"id":"cozyquilt","title":"Cozy Quilt","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"8"}]},{"id":"lacamp","title":"La Campanella : Nu Rave","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"}]},{"id":"outlawreborn","title":"OUT LAW - Reborn","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"cosmicfantastic","title":"Cosmic Fantastic Lovesong","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"6"}]},{"id":"puzzler","title":"Puzzler","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"7"}]},{"id":"beeutiful","title":"BEE-U-TIFUL","charts":[{"difficulty":"1","level":"7"},{"difficulty":"2","level":"9"}]},{"id":"d2","title":"D2","charts":[{"difficulty":"1","level":"8"},{"difficulty":"2","level":"9"},{"difficulty":"3","level":"10"}]},{"id":"xlasher","title":"XLASHER","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"}]},{"id":"sweetdream","title":"Sweet Dream","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"}]},{"id":"putemup","title":"Put Em Up","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"}]},{"id":"sayitfrom","title":"Say It From Your Heart","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"}]},{"id":"rage","title":"Rage Of Demon","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"9"},{"difficulty":"3","level":"9"}]},{"id":"trip","title":"Trip","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"}]},{"id":"monoxide","title":"MonoXide","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"supersonicrmx","title":"SuperSonic(Mr.Funky Remix)","short":"SuperSonic RMX","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"9"}]},{"id":"burnitdown","title":"Burn It Down","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"theguilty","title":"The Guilty","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"airwave","title":"Airwave","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"9"}]},{"id":"eternalfantasy","title":"Eternal Fantasy","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"6"}]},{"id":"loveis","title":"Love is Beautiful","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"5"},{"difficulty":"3","level":"6"}]},{"id":"dreamofwinds","title":"Dream of Winds","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"},{"difficulty":"3","level":"9"}]},{"id":"novarmx","title":"Nova(Mr.Funky Remix)","short":"Nova RMX","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"}]},{"id":"thor","title":"Thor","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"10"}]},{"id":"thenightstage","title":"The Night Stage","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"}]},{"id":"beyondthe","title":"Beyond The Future","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"},{"difficulty":"3","level":"8"}]},{"id":"@youngwon","title":"Forever","charts":[{"difficulty":"1","level":"4"},{"difficulty":"2","level":"6"}]},{"id":"darkenvy","title":"Dark Envy","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"}]},{"id":"getdown","title":"Get Down","charts":[{"difficulty":"1","level":"4"}]},{"id":"rutin","title":"Ruti'n","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"}]},{"id":"secretworld","title":"Secret World","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"}]},{"id":"lovely","title":"Lovely Hands","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"}]},{"id":"jealousy","title":"Jealousy","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"}]},{"id":"desperado","title":"Desperado","charts":[{"difficulty":"1","level":"5"}]},{"id":"inmydream","title":"In My Dream","charts":[{"difficulty":"1","level":"5"}]},{"id":"grave","title":"Grave Consequence","charts":[{"difficulty":"1","level":"7"},{"difficulty":"2","level":"8"}]},{"id":"beatudown","title":"Beat U Down","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"7"}]},{"id":"cypher","title":"Cypher Gate","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"9"},{"difficulty":"3","level":"10"}]},{"id":"readynow","title":"Ready Now","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"8"}]},{"id":"djmax","title":"DJMAX","charts":[{"difficulty":"1","level":"3"},{"difficulty":"2","level":"4"}]},{"id":"luvflowrmx1","title":"Luv Flow(Funky House Mix)","short":"Luv Flow RMX","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"enemyrmx1","title":"Enemy Storm(Dark Jungle Mix)","short":"Enemy Storm RMX","charts":[{"difficulty":"1","level":"6"},{"difficulty":"2","level":"8"},{"difficulty":"3","level":"9"}]},{"id":"masairmx1","title":"MASAI(Electro House Mix)","short":"MASAI RMX","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"desperadormx1","title":"Desperado(Nu skool Mix)","short":"Desperado RMX","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]},{"id":"zetrmx1","title":"Zet(Mr.Funky Remix)","short":"Zet RMX","charts":[{"difficulty":"1","level":"5"},{"difficulty":"2","level":"6"},{"difficulty":"3","level":"7"}]}]
} }
);