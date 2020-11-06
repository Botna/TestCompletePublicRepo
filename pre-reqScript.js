//Follows PascalCase, as it Should in Consul.
var apiName = "ApiName";


var isProdEnvironment = pm.environment.name.includes("Production");
var overloadedTokenName = pm.environment.has("ClientIdFor" + apiName) ? pm.environment.get("ClientIdFor" + apiName) : null;
var overloadedTokenSecret = pm.environment.has("ClientSecretFor" + apiName) ? pm.environment.get("ClientSecretFor" + apiName) : null;
var tokenExpiration = pm.environment.get("GENERATED_tExpiration_for_" + apiName)

var getTokenForEnvironment = function (overloadedTokenName, overloadedTokenSecret) {

    if ((!overloadedTokenName || !overloadedTokenSecret) && !isProdEnvironment) {
        overloadedTokenName = "IDSPostman";
        overloadedTokenSecret = "3ZH#u9M_F%OXL$7MJsv2xh#H3pfA+Y9z";
    }

    if(!overloadedTokenName || !overloadedTokenSecret)
    {
        postman.setEnvironmentVariable("GENERATED_myToken_for_" + apiName, "")
        postman.setEnvironmentVariable("GENERATED_tExpiration_for_" + apiName, (new Date()).getTime());
        console.log("You dont have your Client Credentials setup appropriately in the environmental config.  Please configure an overloaded token following the instructions in the documentation for this api");

        //Hack so that we can see the error without having to look at console. 
        YouClientIdCredentialForThisApi();
    }

    if (tokenExpiration && (new Date()).getTime() < tokenExpiration) {
        console.log("token isn't expired yet, skipping token gathering");
        return;
    }

    var url = pm.environment.get("ApiHost") ? pm.environment.get("ApiHost") + '/auth/token' : "https://YouDoNotHaveAn-ApiHost-variable.com";

    var details = {
        'grant_type': "client_credentials",
        'client_id': overloadedTokenName,
        'client_secret': overloadedTokenSecret
    };

    var formData = '';
    for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formData += encodedKey + '=' + encodedValue + '&';
    }

    const getAuthToken = {
        url: url,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    };
    pm.sendRequest(getAuthToken, function (err, res) {
        var token = 'Bearer ' + res.json().access_token;
        var ttl = res.json().expires_in;
        var expiration = new Date((new Date()).getTime() + (1000 * ttl));
        console.log(token);
        postman.setEnvironmentVariable("GENERATED_myToken_for_" + apiName, token)
        postman.setEnvironmentVariable("GENERATED_tExpiration_for_" + apiName, expiration.getTime());
    });
}
getTokenForEnvironment(overloadedTokenName, overloadedTokenSecret);