window.onload = function(){

    // ** Global Variables
    const mealPlanData = JSON.parse(localStorage.getItem('mealPlanData')) || [];
    const mealsReferenceData = JSON.parse(localStorage.getItem('mealsReferenceData')) || [];
    const remindersData = JSON.parse(localStorage.getItem('remindersData')) || [];
    const settingsData = JSON.parse(localStorage.getItem('settingsData')) || [];
    // ** Meal Seasons
    const mealSeasons = [
        '', 'Year-round', 'Warm Weather', 'Cool Weather', 'Holiday'
    ]
    // ** Meal Types
    const mealTypes = [
        '','Comfort', 'Pasta', 'Poultry', 'Beef', 'Pork', 'Soup', 'Casserole', 'Dessert', 'Restaurant'
    ]

    // Page Elements
    // Main Container & Section Heading
    const mainContainer = document.querySelector('.container');
    const sectionHeading = document.querySelector('#section-heading');
    // Section COntainer
    const homeContainer = document.querySelector('.home');

    // Application Sections Array
    const appSections = [
        {
            name: "Meal Plan",
            section: "meal-plan",
            container: "mealPlanContainer",
            loadContent: function(e){
                loadMealPlan(e);
            }
        },
        {
            name: "Meals Reference",
            section: "meals-reference",
            container: "mealsReferenceContainer",
            loadContent: function(section){
                loadMealsReference(section);
            }
        },
        {
            name: "Reminders",
            section: "reminders",
            container: "remindersContainer",
            loadContent: function(section){
                loadReminders(section);
            }
        },
        {
            name: "Settings",
            section: "settings",
            container: "settingsContainer",
            loadContent: function(section){
                loadSettings(section);
            }
        },
        {
            name: "Simple Meal Planning!",
            section: "home",
            container: "homeContainer",
            loadContent: function(){
                console.log('Well that\'s odd, this is just a console log.');
            }
        }
    ];

    // Days of the week
    const days = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

// ** Build Functions

    // Load Home Screen (Main Page)
    function loadMainPage(){
        appSections.forEach(option => {
            if(option.section != 'home'){
                // Create Button
                mealPlanButton = document.createElement('button');
                mealPlanButton.classList.add('main-button');
                mealPlanButton.classList.add('transition');
                mealPlanButton.textContent = option.name;
                mealPlanButton.dataset.section = option.section;

                mealPlanButton.addEventListener('click', goToSection)
                
                // Append Button to Container
                homeContainer.appendChild(mealPlanButton);
            }
        });
    }

// ** Load Sections

    // Go to section function - hides all divs and loads "shows" the target div
    function goToSection(e){
        // Remove content when going to 'home' section
        if(e.target.dataset.section == 'home'){
            const parent = e.target.parentElement;
            const wrapperToRemove = parent.querySelector('.content-wrapper');
            if (wrapperToRemove === null) {}else{
                wrapperToRemove.remove();
            }
        }

        // Grab Section Object
        const sectionObj = getSectionObject(e);

        // Hide All "Section" divs
        const divs = mainContainer.querySelectorAll('div');
        divs.forEach(div => {
            div.classList.remove('show');
            div.style.zIndex = -10;
        })

        // Show selected "Section" div
        const section = document.querySelector(`.${e.target.dataset.section}`);
        // Delay screen load by 0.5s
        setTimeout(() => {
            section.classList.add('show');
            section.style.zIndex = 10;
        }, 500);

        // Load Section
        loadSection(sectionObj);

        // Load Section Content
        const sectionText = sectionObj.section;
        sectionObj.loadContent(e);
    }
    // Populate Section
    function loadSection(obj){
        // Get Section Container
        const container = mainContainer.querySelector(`.${obj.section}`);

        // Change Heading to Section Name
        sectionHeading.textContent = obj.name;

        // Generate Go Home Button (if not present and not loading home section)
        if(!container.querySelector('button.main-button') && obj.section != 'home'){
            // Generage Home Button
            let goHome = generateHomeButton();
            goHome.addEventListener('click', goToSection);
            container.appendChild(goHome);
        }else{}
    }

// ** Meal Plan FUnctions

    // Load Meal Plan
    function loadMealPlan(e){
        // Grab meal plan container
        const sectionObj = getSectionObject(e);
        sectionText = sectionObj.section;
        const container = mainContainer.querySelector(`.${sectionText}`);
        // Clear previous meal plan
        cleanSectionData(container);

        // Grab date from target button
        const date = e.target.dataset.firstDay;
        let passedDate;
        // Get Passed date (if present) or Make today
        if(date === undefined){
            passedDate = new Date();
        }
        else{
            passedDate = new Date(date);
        }
        // Set Time to 12am (reset)
        passedDate.setHours(0);
        passedDate.setMinutes(0);
        passedDate.setSeconds(0);
        passedDate.setMilliseconds(0);
        // Set First Day of week
        const firstDayOfWeek = new Date(passedDate.getTime() - (passedDate.getDay() * 86400000));
        // Set to 12am (reset)
        firstDayOfWeek.setHours(0);
        firstDayOfWeek.setMinutes(0);
        firstDayOfWeek.setSeconds(0);
        firstDayOfWeek.setMilliseconds(0);
        const firstDayOfWeekText = getDateText(firstDayOfWeek);
        // Set End of Week
        const lastDayOfWeek = new Date(firstDayOfWeek.getTime() + (6 * 86400000) + 86399999);
        // Week Array
        const currentWeek = []
        for(var i = 0; i < 7; i++){
            const weekDay = new Date(firstDayOfWeek.getTime() + (i * 86400000));
            currentWeek.push(weekDay);
        }

        // Get Meal Plan Data for that week (using first day of week)
        const currentWeekMealPlanData = [];
        mealPlanData.forEach(meal => {
            mealDate = new Date(meal.date);
            if(mealDate >= firstDayOfWeek && mealDate <= lastDayOfWeek){
                console.log('Meal Added!');
                currentWeekMealPlanData.push(meal);
            }
        });

        // Wrap Meal Plan
        const mealPlanWrapper = document.createElement('div');
        mealPlanWrapper.classList.add('content-wrapper');

        // Week of and Prev/Next Week Container
        const weekOfContainer = document.createElement('div');
        weekOfContainer.classList.add('week-of');

        // Add Previous Week Button
        const prevWeekDate = new Date(firstDayOfWeek.getTime() - (7 * 86400000));
        // Check if daylight savings occured
        if(prevWeekDate.getHours() == 23){
            prevWeekDate.setTime(prevWeekDate.getTime() + 3600000);
        } else if(prevWeekDate.getHours() == 1){
            prevWeekDate.setTime(prevWeekDate.getTime() - 3600000);
        }
        const prevWeekBtn = document.createElement('button');
        prevWeekBtn.dataset.firstDay = `${prevWeekDate}`;
        prevWeekBtn.dataset.section = sectionText;
        prevWeekButtonText = document.createTextNode('Prev Week');
        prevWeekBtn.appendChild(prevWeekButtonText);
        prevWeekBtn.addEventListener('click', loadMealPlan);
        weekOfContainer.appendChild(prevWeekBtn);

        // Set "Week Of Heading"
        const weekOfHeading = document.createElement('h2');
        const weekOfHeadingText = document.createTextNode(`Week of: ${firstDayOfWeekText}`);
        weekOfHeading.appendChild(weekOfHeadingText);
        weekOfContainer.appendChild(weekOfHeading);

        // Add Next Week Button
        const nextWeekDate = new Date(firstDayOfWeek.getTime() + (7 * 86400000));
        // Check if daylight savings occurred
        if (nextWeekDate.getHours() == 23) {
            nextWeekDate.setTime(nextWeekDate.getTime() + 3600000);
        } else if (nextWeekDate.getHours() == 1) {
            nextWeekDate.setTime(nextWeekDate.getTime() - 3600000);
        }
        const nextWeekBtn = document.createElement('button');
        nextWeekBtn.dataset.firstDay = `${nextWeekDate}`;
        nextWeekBtn.dataset.section = sectionText;
        nextWeekButtonText = document.createTextNode('Next Week');
        nextWeekBtn.appendChild(nextWeekButtonText);
        nextWeekBtn.addEventListener('click', loadMealPlan);
        weekOfContainer.appendChild(nextWeekBtn);

        // Append to wrapper contaier
        mealPlanWrapper.appendChild(weekOfContainer);

        // Load This Weeks Meal Plan
        const planList = document.createElement('ul');
        currentWeek.forEach(day => {
            // Initiate Meal & Recipe Link
            let currentMeal = '';
            let mealLink = '';
            let mealSeason = '';
            let mealDate = '';
            currentWeekMealPlanData.forEach(meal => {
                if(getDateText(new Date(meal.date)) == getDateText(day)){
                    mealDate = meal.date;
                    currentMeal = meal.meal.name;
                    mealLink = meal.meal.link;
                    mealSeason = meal.meal.season;
                } 
            })
            // Create 'li' to append to 'ul'
            const listItem = document.createElement('li');
            listItem.dataset.date = day;
            // Create List Item Text
            const listItemText = document.createTextNode(`${days[day.getDay()]}: ${currentMeal}`);
            listItem.appendChild(listItemText);
            // Add 'addMea' or 'updateMeal' eventListener
            if (mealDate == '') {
                listItem.addEventListener('click', addMeal);
            } else {
                listItem.classList.add('meal-exists');
                listItem.addEventListener('click', updateMeal);
            }
            planList.appendChild(listItem);
       
        })
        mealPlanWrapper.appendChild(planList);
        container.appendChild(mealPlanWrapper);
    }
    // Add new meal
    function addMeal() {
        console.log('Add new meal!')

        // Meal Filter Object
        let mealFilter = {
            type: '',
            season: ''
        };

        // Add new/existing meal
        let addType = '';

        // Create 'Modal/Popup'
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        const modal = document.createElement('div');
        modal.classList.add('modal')
        modal.classList.add('add-meal')
        // Modal Heading Text
        const modalHeading = document.createElement('h1');
        const modalDate = getDateText(new Date(this.dataset.date));
        const modalHeadingText = document.createTextNode(`Add Meal for ${modalDate}`)
        modalHeading.appendChild(modalHeadingText);
        modal.appendChild(modalHeading);

        // *** Add radio button to select 'create new meal' or 'select an existing meal'
        const addMealSelectionTypeContainer = document.createElement('div');
        addMealSelectionTypeContainer.classList.add('add-meal-options')
        // * New Meal option
        const newMealRadioContainer = document.createElement('div');
        // New Meal Label
        const newMealRadioLabel = document.createElement('label');
        const newMealRadioLabelText = document.createTextNode('Create New Meal');
        newMealRadioLabel.setAttribute('for', 'new-meal');
        newMealRadioLabel.appendChild(newMealRadioLabelText);
        // New Meal Radio Button
        const newMealRadioButton = document.createElement('input');
        newMealRadioButton.classList.add('add-meal-radio')
        newMealRadioButton.setAttribute('type', 'radio');
        newMealRadioButton.id = 'new-meal';
        newMealRadioButton.setAttribute('name', 'add-meal');
        newMealRadioButton.setAttribute('value', 'new');
        newMealRadioButton.addEventListener('change', (e) => {
            modalSectionToShow(e);
            addType = 'new-meal';
        })
        // Append Children to containers
        newMealRadioContainer.appendChild(newMealRadioLabel);
        newMealRadioContainer.appendChild(newMealRadioButton);
        addMealSelectionTypeContainer.appendChild(newMealRadioContainer);
        // * Existing Meal option
        const existingMealRadioContainer = document.createElement('div');
        // Existing Meal Label
        const existingMealRadioLabel = document.createElement('label');
        const existingMealRadioLabelText = document.createTextNode('Choose Existing Meal');
        existingMealRadioLabel.setAttribute('for', 'existing-meal');
        existingMealRadioLabel.appendChild(existingMealRadioLabelText);
        // Existing Meal Radio Button
        const existingMealRadioButton = document.createElement('input');
        existingMealRadioButton.classList.add('add-meal-radio')
        existingMealRadioButton.setAttribute('type', 'radio');
        existingMealRadioButton.id = 'existing-meal';
        existingMealRadioButton.setAttribute('name', 'add-meal');
        existingMealRadioButton.setAttribute('value', 'new');
        existingMealRadioButton.addEventListener('change', (e) => {
            modalSectionToShow(e);
            addType = 'existing-meal';
        });
        // Append Children to containers
        existingMealRadioContainer.appendChild(existingMealRadioLabel);
        existingMealRadioContainer.appendChild(existingMealRadioButton);
        addMealSelectionTypeContainer.appendChild(existingMealRadioContainer);
        modal.appendChild(addMealSelectionTypeContainer);

    // *** New Meal Options
        const newMealOptionsContainer = document.createElement('div');
        newMealOptionsContainer.classList.add('new-meal-options');
        newMealOptionsContainer.classList.add('options-section');
        const newMealOptionsHeading = document.createElement('p');
        const newMealOptionsHeadingText = document.createTextNode('Fill out "New Meal" options below:');
        newMealOptionsHeading.appendChild(newMealOptionsHeadingText);
        newMealOptionsContainer.appendChild(newMealOptionsHeading);

        // ** Input Fields & Labels

        // * Meal Name
        const newMealNameContainer = document.createElement('div');
        newMealNameContainer.classList.add('meal-name');
        // Label
        newMealNameLabel = document.createElement('label')
        newMealNameLabel.setAttribute('for', 'meal-name');
        newMealNameLabelText = document.createTextNode('Meal Name');
        newMealNameLabel.appendChild(newMealNameLabelText);
        newMealNameContainer.appendChild(newMealNameLabel);
        // Input
        newMealNameInput = document.createElement('input');
        newMealNameInput.setAttribute('type', 'text');
        newMealNameInput.setAttribute('name', 'meal-name');
        newMealNameContainer.appendChild(newMealNameInput);
        newMealOptionsContainer.appendChild(newMealNameContainer);

        // * Meal Type (Pasta, comfort, etc.)
        const newMealTypeContainer = document.createElement('div');
        newMealTypeContainer.classList.add('meal-type');
        // Label
        const newMealTypeLabel = document.createElement('label');
        newMealTypeLabel.setAttribute('for', 'meal-type');
        const newMealTypeLabelText = document.createTextNode('Meal Type');
        newMealTypeLabel.appendChild(newMealTypeLabelText);
        newMealTypeContainer.appendChild(newMealTypeLabel);
        // Select
        const mealTypeSelection = document.createElement('select');
        mealTypeSelection.setAttribute('name', 'season-selection');
        mealTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            optionText = document.createTextNode(type);
            option.appendChild(optionText);
            mealTypeSelection.appendChild(option);
        });
        newMealTypeContainer.appendChild(mealTypeSelection);
        newMealOptionsContainer.appendChild(newMealTypeContainer)

        // * Meal Link (Recipe/Restaurant)
        const newMealLinkContainer = document.createElement('div');
        newMealLinkContainer.classList.add('meal-link');
        // Label
        newMealLinkLabel = document.createElement('label')
        newMealLinkLabel.setAttribute('for', 'meal-link');
        newMealLinkLabelText = document.createTextNode('Recipe/Restaurant Link');
        newMealLinkLabel.appendChild(newMealLinkLabelText);
        newMealLinkContainer.appendChild(newMealLinkLabel);
        // Input
        newMealLinkInput = document.createElement('input');
        newMealLinkInput.setAttribute('type', 'url');
        newMealLinkInput.setAttribute('name', 'meal-name');
        newMealLinkContainer.appendChild(newMealLinkInput);
        newMealOptionsContainer.appendChild(newMealLinkContainer);

        // * Meal Season Selection Container
        const seasonSelectionContainer = document.createElement('div');
        seasonSelectionContainer.classList.add('meal-season');
        // Label Element
        const seasonSelectionLabel = document.createElement('label');
        const seasonSelectionLabelText = document.createTextNode('Season Selection');
        seasonSelectionLabel.appendChild(seasonSelectionLabelText);
        seasonSelectionLabel.setAttribute('for', 'season-selection');
        seasonSelectionContainer.appendChild(seasonSelectionLabel);
        // Select Element
        const seasonSelection = document.createElement('select');
        seasonSelection.setAttribute('name', 'season-selection');
        mealSeasons.forEach(meal => {
            const option = document.createElement('option');
            option.value = meal;
            optionText = document.createTextNode(meal);
            option.appendChild(optionText);
            seasonSelection.appendChild(option);
        });
        seasonSelectionContainer.appendChild(seasonSelection);
        newMealOptionsContainer.appendChild(seasonSelectionContainer);
        modal.appendChild(newMealOptionsContainer);

    // *** Existng Meal Options
        const existingMealOptionsContainer = document.createElement('div');
        existingMealOptionsContainer.classList.add('existing-meal-options');
        existingMealOptionsContainer.classList.add('options-section');
        const existingMealOptionHeading = document.createElement('p');
        const existingMealOptionsContainerText = document.createTextNode('Use the "Type" and "Season" lists to filter your meal options.');
        existingMealOptionHeading.appendChild(existingMealOptionsContainerText)
        existingMealOptionsContainer.appendChild(existingMealOptionHeading);

        // ** Inputs Fields & Labels

        // * Meal Type Drop Down (filter)
        const existingMealTypeContainer = document.createElement('div');
        existingMealTypeContainer.classList.add('meal-type-filter');
        // Label
        const existingMealTypeSelectionLabel = document.createElement('label');
        const existingMealTypeSelectionLabelText = document.createTextNode('Meal Type Filter');
        existingMealTypeSelectionLabel.appendChild(existingMealTypeSelectionLabelText);
        existingMealTypeSelectionLabel.setAttribute('for', 'meal-type-filter');
        existingMealTypeContainer.appendChild(existingMealTypeSelectionLabel);
        // Select
        const existingMealTypeSelection = document.createElement('select');
        existingMealTypeSelection.setAttribute('name', 'type-selection');
        existingMealTypeSelection.addEventListener('change', (e) => {
            mealFilter = setMealFilters(e, mealFilter);
            showFilteredMeals(mealFilter);
        });
        mealTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            optionText = document.createTextNode(type);
            option.appendChild(optionText);
            existingMealTypeSelection.appendChild(option);
        });
        existingMealTypeContainer.appendChild(existingMealTypeSelection);
        existingMealOptionsContainer.appendChild(existingMealTypeContainer);
        // * Meal Season Drop Down (filter)
        const existingMealSeasonContainer = document.createElement('div');
        existingMealSeasonContainer.classList.add('meal-type-filter');
        // Label
        const existingMealSeasonSelectionLabel = document.createElement('label');
        const existingMealSeasonSelectionLabelText = document.createTextNode('Meal Type Filter');
        existingMealSeasonSelectionLabel.appendChild(existingMealSeasonSelectionLabelText);
        existingMealSeasonSelectionLabel.setAttribute('for', 'meal-type-filter');
        existingMealSeasonContainer.appendChild(existingMealSeasonSelectionLabel);
        // Select
        const existingMealSeasonSelection = document.createElement('select');
        existingMealSeasonSelection.setAttribute('name', 'season-selection');
        existingMealSeasonSelection.addEventListener('change', (e) => {
            mealFilter = setMealFilters(e, mealFilter);
            showFilteredMeals(mealFilter);
        });
        mealSeasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season;
            optionText = document.createTextNode(season);
            option.appendChild(optionText);
            existingMealSeasonSelection.appendChild(option);
        });
        existingMealSeasonContainer.appendChild(existingMealSeasonSelection);
        existingMealOptionsContainer.appendChild(existingMealSeasonContainer);
        // * Meal List (Either a "ul" or "select"?)
        // showFilteredMeals(mealFilter);

        modal.appendChild(existingMealOptionsContainer);

        // ** Modal Buttons
        const addMealBtnContainer = document.createElement('div');
        addMealBtnContainer.classList.add('modal-button-container')
        // * Add Meal Button
        const addMealBtn = document.createElement('button');
        const addMealBtnText = document.createTextNode('Add Meal');
        addMealBtn.appendChild(addMealBtnText);
        // Set data attributes for reloading meal plan
        addMealBtn.dataset.date = this.dataset.date;
        addMealBtn.dataset.section = 'meal-plan';
        // Add eventlistener for button blick
        addMealBtn.addEventListener('click', (e) => {
            const date = this.dataset.date;
            // Check if 'new-meal' radio is selected
            if(addType == 'new-meal'){
                const meal = newMealObject(newMealNameInput.value, mealTypeSelection.value, newMealLinkInput.value, seasonSelection.value);
                if(meal){
                    addMealPlanData(date, meal);
                    loadMealPlan(e);
                    overlay.remove();
                }
            } else if(addType == 'existing-meal'){
                console.log('Existing Meal Selected');
                const radios = document.querySelectorAll('.meal-selection-radio');
                console.log(radios);
                let selected = '';
                radios.forEach(radio => radio.checked ? selected = radio.value : '');
                const mealObject = mealsReferenceData
                    .filter(meal => meal.name == selected);
                console.log('Meal Object: ', mealObject);
                const meal = {
                    name: mealObject[0].name,
                    type: mealObject[0].type,
                    link: mealObject[0].link,
                    season: mealObject[0].season
                }
                console.log(meal);
                if(meal){
                    addMealPlanData(date, meal);
                    loadMealPlan(e);
                    overlay.remove();
                }
            }
        });
        // * Cancel Button
        const cancelAddMealBtn = document.createElement('button');
        const cancelAddMealBtnText = document.createTextNode('Cancel');
        cancelAddMealBtn.appendChild(cancelAddMealBtnText);
        cancelAddMealBtn.addEventListener('click', () => {
            overlay.remove();
        });
        addMealBtnContainer.appendChild(addMealBtn);
        addMealBtnContainer.appendChild(cancelAddMealBtn);
        modal.appendChild(addMealBtnContainer);
        overlay.appendChild(modal);
        overlay.classList.add('show')
        document.body.appendChild(overlay);
    }
    // Add Meal Plan Data
    function addMealPlanData(date, meal) {
        const mealPlanObject = newMealPlanObject(date, meal);
        console.log('Meal Plan Object:',mealPlanObject)
        mealPlanData.push(mealPlanObject);
        localStorage.setItem('mealPlanData', JSON.stringify(mealPlanData));
    }
    // Update Meal
    function updateMeal() {
        console.log('Update meal!')
    }
    // Set Meal Filters
    function setMealFilters(e, object){
        console.log(e)
        const filterType = e.target.name;
        const filteredItem = e.target.options[e.target.selectedIndex].value;
        // Filter Logic (use object )
        if(filterType == 'season-selection'){
            object.season = filteredItem;
        }else{
            object.type = filteredItem;
        }
        return object;
    }
    // Show Filtered Meal List
    function showFilteredMeals(object){
        // Grab Parent Container
        const container = document.querySelector('.existing-meal-options');
        // Grag existing filtered list if present
        const listToClose = document.querySelector('.filtered-meal-list');
        if(listToClose != undefined){
            listToClose.remove();
        }
        // Create 'ul' to list meals
        const mealList = document.createElement('ul');
        mealList.classList.add('filtered-meal-list');

        // Filter Meals
        let filteredMeals = mealsReferenceData
            .filter(meal => meal.type == object.type || object.type == '')
            .filter(meal => meal.season == object.season || object.season == '');

        // Create 'li' elements for filtered list and append to 'ul'
        filteredMeals.forEach(meal => {
            const listItem = document.createElement('li');
            const listItemRadio = document.createElement('input');
            listItemRadio.classList.add('meal-selection-radio')
            listItemRadio.setAttribute('type', 'radio');
            listItemRadio.setAttribute('name', 'meal-selection-radio');
            listItemRadio.setAttribute('value', meal.name);
            listItem.appendChild(listItemRadio);
            const listItemText = document.createTextNode(meal.name);
            listItem.appendChild(listItemText);
            mealList.appendChild(listItem);
        })

        // Append 'ul' to container
        container.appendChild(mealList);
    }

// ** Utility Functions **

    // Generate Home Button
    function generateHomeButton(){
        mealPlanButton = document.createElement('button');
        mealPlanButton.classList.add('main-button');
        mealPlanButton.classList.add('transition');
        mealPlanButton.textContent = 'Go Home';
        mealPlanButton.dataset.section = 'home';

        mealPlanButton.addEventListener('click', goToSection)

        return mealPlanButton;
    }
    // Generate Date Text
    function getDateText(date){
        return dateText = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
    }
    // Grab Section Object
    function getSectionObject(e){
        const index = appSections.map(opt => opt.section).indexOf(`${e.target.dataset.section}`);
        const obj = appSections[index];
        return obj;
    }
    // Remove prior section data and update text
    function cleanSectionData(container){
        if (container.querySelector('.content-wrapper') != null) {
            container.querySelector('.content-wrapper').remove();
        }
    }
    // Modal Section To Show Function
    function modalSectionToShow(e){
        // Remove 'show' class from children
        const container = document.querySelector('.modal');
        const children = container.querySelectorAll('.options-section');
        children.forEach((child) => {
            child.classList.remove('show')
        });
        // Select section to show
        const showSectionText = `.${e.target.id}-options`;
        const sectionToShow = document.querySelector(showSectionText);
        setTimeout(() => sectionToShow.classList.add('show'),500);
    }
    // New Meal Object
    function newMealObject(meal, type, link, season) {
        // console.log('Attempting to create new meal!', mealsReferenceData);
        // Meal Exists flag (if a meal with the same name is already in the database)
        let mealExists = false;

        // Create new meal object
        const mealObject = {
            name: meal,
            type: type,
            link: link,
            season: season
        }

        // Check the mealsReferenceData array for another meal with the same name
        mealsReferenceData.forEach(ref => {
            console.log(mealObject.name, ref.name)
            if(mealObject.name == ref.name) {
                // If meal names match then set mealExists to true
                mealExists = true;
            }
        })

        // If meal is not already in the database then add it and return mealObject
        if(!mealExists) {
            mealsReferenceData.push(mealObject);
            localStorage.setItem('mealsReferenceData', JSON.stringify(mealsReferenceData));
            return mealObject;
        }else{
            // If meal exists return false and alert user.
            alert('Meal name already exists. Please choose a different name.');
            return false;
        }
        
    }
    // New Meal Plan Object
    function newMealPlanObject(date, meal){
        const newMealPlanObject = {
            date: date,
            meal: meal
        }
        return newMealPlanObject;
    }

    // ** Start Script
    function start() {
        console.clear();
        loadMainPage();
    }
    start();
}