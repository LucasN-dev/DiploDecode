async function getJSON(json) {

    let codes = new Promise(function(resolve) {
        fetch(json)
        .then(res => res.json())
        .then(data => {
            codes = data;
        })
        .then(() => {
            resolve(codes)
        });
    });
    return codes
}

async function decodeImmat(rawImmat) {

    // clear previous results
    clearDisplay()

    // clean registration number
    let cleanImmat = rawImmat.toUpperCase().replace(/[^a-zA-Z0-9]+/g, "");

    // dirty regex to eliminate odd registration numbers
    if (/A|B|F|G|H|I|J|L|O|P|Q|R|T|V|W|Y/.test(cleanImmat)) {
        displayError();
        return false;
    }

    // check if delegation (first char is E,S,U, or N)
    let delegation = "None"
    if (!(cleanImmat.charAt(0) >= '0' && cleanImmat.charAt(0) <= '9')) {
        delegation = cleanImmat.charAt(0);
        cleanImmat = cleanImmat.slice(1);
    }

    // retrieve country/org code, if no letter it assumes user has only typed the country/org code
    let code = parseInt(cleanImmat.split(/[A-Z]/)[0]);

    // return error if no code is found
    if (isNaN(code)) {
        displayError();
        return false;
    }

    // self explanatory
    if (code > 200 && code <= 400) {
        code -= 200;
    }

    // retrieve countries/orgs identification codes
    const codes = await getJSON("./data/codes.json");
    let result = "NONE";

    // retrieve country/org string if code is valid
    if (String(code) in codes ) {
        result = codes[String(code)];
    }


    let status = "NONE"
    let tax = "NONE"

    if (cleanImmat.length >= 2) {
        // get status
        let rawstatus = cleanImmat.replace(/[^a-zA-Z]+/g, "");
        if (rawstatus.includes("CMD")) {
            status = "Statut : Chef de mission diplomatique (Ambassadeur)"
        } else if (rawstatus.includes("CD")) {
            status = "Statut : Corps diplomatique"
        } else if (rawstatus.includes("C")) {
            status = "Statut : Corps consulaire"
        }  else if (rawstatus.includes("K")) {
            status = "Statut : Personnel technique/administratif non diplomatique"
        }

        // get tax status
        let rawtax = cleanImmat.slice(-1);
        if (rawtax === 'Z') {
            tax = "Véhicule exempté de taxes"
        } else if (rawtax === 'X') {
            tax = "Véhicule non exempté de taxes"
        }
    }

    var resultArray = ["error","NONE","NONE"]

    // return country/org + status/tax status or error
    if ( result !== "NONE") {

        let resultTxt = "";

        if (code <= 400 && delegation === "None" ) {
            resultTxt = "Pays : " + result;
        } else if (code <= 400) {
            switch (delegation) {
                case 'E':
                    resultTxt = "Pays : " + result + " (Délégation à l'OCDE)";
                    break;
                case 'S':
                    resultTxt = "Pays : " + result + " (Délégation au Conseil de l'Europe)";
                    break;
                case 'U':
                    resultTxt = "Pays : " + result + " (Délégation à l'UNESCO)";
                    break;
                case 'N':
                    resultTxt = "Pays : " + result + " (Délégation à l'OTAN)";
                    break;
                default:
                    displayError();
                    return false;
              }
        } else if (code == 500) {
            resultTxt = "Haute personnalité 🤫🤫";
        } else {
            resultTxt = "Organisation : " + result;
        }
        resultArray = [resultTxt, status, tax];
        displayResults(resultArray);
        return false;
    } else {
        displayError();
        return false;
    }
}

function displayResults(results) {

    document.getElementById("resultCountry").innerHTML = `<li>${results[0]}</li>`;
    document.getElementById("resultStatus").innerHTML = `<li>${results[1]}</li>`;
    document.getElementById("resultTax").innerHTML = `<li>${results[2]}</li>`;

    if (results[0] !== "error") {
        document.getElementById("resultCountry").style.display = "block";
    }
    if (results[1] !== "NONE") {
        document.getElementById("resultStatus").style.display = "block";
    }
    if (results[2] !== "NONE") {
        document.getElementById("resultTax").style.display = "block";
    }
    document.getElementById("resultsDiv").style.display = "block";

}

function displayError() {

    document.getElementById("errorDiv").innerHTML = "Immatriculation erronée";
    document.getElementById("errorDiv").style.display = "block";
}

function clearDisplay() {

    document.getElementById("resultsDiv").style.display = "none";
    document.getElementById("errorDiv").style.display = "none";
    document.getElementById("resultCountry").style.display = "none";
    document.getElementById("resultStatus").style.display = "none";
    document.getElementById("resultTax").style.display = "none";
}