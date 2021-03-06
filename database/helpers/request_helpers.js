import db from '../config';
import User from '../models/users';
import Analysis from '../models/analyses';
import AnalysisTrait from '../models/analyses_traits';

module.exports = {

  githubUserData: (profile) => {
    return {
      username: profile.nickname,
      displayName: profile.displayName,
      email: profile.emails[0].value.email,
      picture: profile.picture
    }
  },

  googleUserData: (profile) => {
    return {
      username: profile.nickname,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      picture: profile.picture
    }
  },  

  linkedinUserData: (profile) => {
    return {
      username: profile.nickname,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      picture: profile.picture
    }
  },

  auth0UserData: (profile) => {
    return {
      username: profile.nickname,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      picture: profile.picture
    }
  },

  facebookUserData: (profile) => {
    return {
      username: profile.nickname,
      displayName: profile.displayName,
      email: profile.emails ? profile.emails[0].value : profile.id,
      picture: profile._json.picture_large
    }
  },

  findOrCreateUser: (userData) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: userData.email })
      .exec((err, user) => {
        if (err) {
          reject(err);
        } else if (!user) {
          let user = new User(userData);
          user.save((err, success) => {
            err ? reject(err) : resolve(user);
          });
        } else {
          resolve(user);
        }
      });
    });
  },

  findAllDataFromAnAnalysis: function(req, res) {
    var routeLength = '/analyze/'.length;
    var id = req.url.slice(routeLength);
    Analysis.findOne({_id: id})
    .exec(function(err, analysis) {
      if (err) {
        res.status(500).send(err);
      } else if (analysis) {
        var response = {
          name: analysis.person,
          context: analysis.context,
          word_count: analysis.word_count,
          user_id: analysis.user_id
        };
        //use the id of the analysis to query for all rows of the analyses_traits table 
        AnalysisTrait.find({analysis_id: id})
        .exec(function(err, analysisTraits) {
          if (err) {
            res.status(500).send(err);
          } else {
            response.traits = analysisTraits.slice();
            res.send(JSON.stringify(response));
          }
        });
      } else {
        res.send(JSON.stringify({error: 'No analysis found.'}));
      }
    });
  },

  getPublicAnalyses: function(req, res) {
    Analysis.find({private: false})
    .exec(function(err, publicArray) {
      if (err) { 
        res.status(500).send(err); 
      } else {
        res.send(JSON.stringify(publicArray));
      }
    });
  },

  getUserAnalyses: function(req, res) {
    if (!req.user) {
      res.send('No user.'); 
    } else {
      Analysis.find({user_id: req.user.userEmail})
      .exec(function(err, userAnalyses) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(JSON.stringify(userAnalyses));
        }
      });     
    }
  }

};



