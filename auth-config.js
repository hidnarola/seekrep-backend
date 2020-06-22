module.exports = {
  facebookAuth: {
    clientID: "2831009733683828",
    clientSecret: "8307558fd96c78238622e40eb273df74",
    // callbackURL: "http://localhost:3000/auth/facebook/callback",
    callbackURL: "https://seekrep-backend.herokuapp.com/auth/facebook/callback",
    scope: ["email"]
    // profileURL: "https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email"
  },

  googleAuth: {
    clientID:
      "786932545380-dt9omvg5u3taapqdv4cv7v8tadtml487.apps.googleusercontent.com",
    clientSecret: "OamxjeANY-wWwQygE5JCTDP1",
    // callbackURL: "http://localhost:3000/auth/google/callback",
    callbackURL: "https://seekrep-backend.herokuapp.com/auth/google/callback"
  }
};
