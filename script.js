const API_TOKEN = '275f4d2f0024a105da5b4fea4d25d66dd5bfd8b4';

document.querySelector('form').addEventListener('submit', async function(event) {
    event.preventDefault();

    document.getElementById('loading').style.display = 'block';
    document.getElementById('mainContainer').classList.add('blur');
    
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var phone = document.getElementById('phone').value;
    var email = document.getElementById('email').value;
    var jobType = document.getElementById('jobType').value;
    var jobDescription = document.getElementById('jobDescription').value;
    var jobSource = document.getElementById('jobSource').value;
    var address = document.getElementById('address').value;
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    var zipCode = document.getElementById('zipCode').value;
    var area = document.getElementById('area').value;
    var startDate = document.getElementById('startDate').value;
    var startTime = document.getElementById('startTime').value;
    var endTime = document.getElementById('endTime').value;
    var testSelect = document.getElementById('testSelect').value;

    if (!firstName || !lastName || !phone || !email || !jobType || !jobDescription || !jobSource || !address || !city || !state || !zipCode || !area || !startDate || !startTime || !endTime || !testSelect) {
        alert('Please fill in all fields.');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContainer').classList.remove('blur');
        return;
    }

    var firstNameKey = await checkAndCreateField('First name', API_TOKEN, baseUrl);
    var lastNameKey = await checkAndCreateField('Last name', API_TOKEN, baseUrl);
    var phoneKey = await checkAndCreateField('Phone', API_TOKEN, baseUrl);
    var emailKey = await checkAndCreateField('Email', API_TOKEN, baseUrl);
    var jobTypeKey = await checkAndCreateField('Job Type', API_TOKEN, baseUrl);
    var jobDescriptionKey = await checkAndCreateField('Job Description', API_TOKEN, baseUrl);
    var jobSourceKey = await checkAndCreateField('Job Source', API_TOKEN, baseUrl);
    var addressKey = await checkAndCreateField('Address', API_TOKEN, baseUrl);
    var cityKey = await checkAndCreateField('City', API_TOKEN, baseUrl);
    var stateKey = await checkAndCreateField('State', API_TOKEN, baseUrl);
    var zipCodeKey = await checkAndCreateField('Zip Code', API_TOKEN, baseUrl);
    var areaKey = await checkAndCreateField('Area', API_TOKEN, baseUrl);
    var startDateKey = await checkAndCreateField('Start Date', API_TOKEN, baseUrl);
    var startTimeKey = await checkAndCreateField('Start Time', API_TOKEN, baseUrl);
    var endTimeKey = await checkAndCreateField('End Time', API_TOKEN, baseUrl);

    try {
        const searchResponse = await axios.get(`${baseUrl}/v1/persons/search?api_token=${API_TOKEN}&term=${firstName} ${lastName}&fields=name`);
        console.log(searchResponse);

        var personId;
        if (searchResponse.data.data && searchResponse.data.data.items && searchResponse.data.data.items.length > 0) {
            personId = searchResponse.data.data.items[0].item.id;
        } else {
            const personResponse = await axios.post(`${baseUrl}/v1/persons?api_token=${API_TOKEN}`, {
                name: firstName + ' ' + lastName,
                email: email,
                phone: phone
            });
            console.log(personResponse);
            personId = personResponse.data.data.id;
        }

        var deal = {
            title: `Job type: ${jobType}, job source: ${jobSource}, job description: ${jobDescription}`,
            value: 0,
            currency: 'USD',
            person_id: personId,
            [firstNameKey]: firstName,
            [lastNameKey]: lastName,
            [phoneKey]: phone,
            [emailKey]: email,
            [jobTypeKey]: jobType,
            [jobDescriptionKey]: jobDescription,
            [jobSourceKey]: jobSource,
            [addressKey]: address,
            [cityKey]: city,
            [stateKey]: state,
            [zipCodeKey]: zipCode,
            [areaKey]: area,
            [startDateKey]: startDate,
            [startTimeKey]: startTime,
            [endTimeKey]: endTime,
        };

        const dealResponse = await axios.post(`${baseUrl}/v1/deals?api_token=${API_TOKEN}`, deal);
        console.log(dealResponse);

        var noteContent = `first name - ${firstName}\nlast name - ${lastName}\nphone - ${phone}\nemail - ${email}\njob type - ${jobType}\njob description - ${jobDescription}\njob source - ${jobSource}\naddress - ${address}\ncity - ${city}\nstate - ${state}\nzip code - ${zipCode}\narea - ${area}\nstart date - ${startDate}\nstart time - ${startTime}\nend time - ${endTime}\ntest select - ${testSelect}`;

        var note = {
            content: noteContent,
            deal_id: dealResponse.data.data.id,
            pinned_to_deal_flag: true
        };

        const noteResponse = await axios.post(`${baseUrl}/v1/notes?api_token=${API_TOKEN}`, note);
        console.log(noteResponse);
        
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('dealLink').innerHTML = "<a href='" + baseUrl + "/deal/" + dealResponse.data.data.id + "' target='_blank'>View the deal</a>";
    } catch (error) {
        console.error(error);
        alert('An error occurred while creating a deal.');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContainer').classList.remove('blur');
    }
});

document.getElementById('backButton').addEventListener('click', function() {
    location.reload();
});

async function checkAndCreateField(fieldName, apiToken, baseUrl) {
    const url = `${baseUrl}/v1/dealFields?api_token=${apiToken}`;

    try {
        const response = await axios.get(url);
        const fields = response.data.data;

        const existingField = fields.find(field => field.name === fieldName);

        if (existingField) {
            console.log(`Field ${fieldName} already exists.`);
            return existingField.key;
        } else {
            const newField = {
                name: fieldName,
                field_type: 'text',
                add_visible_flag: true
            };

            const createResponse = await axios.post(url, newField);
            console.log(`Field ${fieldName} created with ID: ${createResponse.data.data.id}`);
            return createResponse.data.data.key; 
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}
