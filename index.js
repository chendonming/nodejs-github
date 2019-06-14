#!/usr/bin/env node

var inquirer = require('inquirer');
var axios = require('axios');
var chalk = require('chalk');
var log = console.log;

var api = {
  user: async () => {
    return await axios({
      url: 'https://api.github.com/user',
      method: 'GET',
    });
  },
  repos: async () => {
    return await axios({
      url: 'https://api.github.com/user/repos',
      method: 'GET',
    });
  },
  deleteRepos: async (user, name) => {
    return await axios({
      method: 'DELETE',
      url: `https://api.github.com/repos/${user}/${name}`,
    });
  },
  login: async () => {
    return await inquirer.prompt([
      {
        name: 'username',
        message: 'username?'
      },
      {
        name: 'password',
        type: 'password',
        message: 'password?'
      }
    ]);
  },
  listRepos: async (repos) => {
    var list = [];
    repos.forEach(v => {
      var desc = v.description === null ? '' : v.description;
      list.push({name: v.full_name + ' ' + desc});
    });
    return await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'rep',
        message: 'select need cleared repos',
        choices: list
      }
    ]);
  }
};

(async () => {
  var inf = await api.login();
  var base64 = new Buffer.from(inf.username + ':' + inf.password).toString('base64');
  axios.interceptors.request.use(config => {
    config.headers = {
      Authorization: 'Basic ' + base64
    };
    return config;
  });
  var user = await api.user();
  log(`welcome ! ${chalk.green(user.data.name || user.data.login)}`);
  var repos = await api.repos();
  var selectRepos = await api.listRepos(repos.data);
  for (var j = 0; j < selectRepos.rep.length; j++) {
    var name = selectRepos.rep[j].indexOf(' ') === -1 ? selectRepos.rep[j] : selectRepos.rep[j].substring(0, selectRepos.rep[j].indexOf(' '));
    await api.deleteRepos(user.data.login, name);
  }
  log(chalk.green('successfull!'));
})();
