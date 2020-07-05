/**
 * Todo for future:
 *  1) Create budget for each Month (In year)
 *  2) Create option to add item to 'Popular List or Most Used Ones'
 *  3) Store budget in localStorage || cookies
 *  4) Edit Item
 *  5) Statistic (Overview of Year)
 */


/**
 * Creating 3 seperated modules
 *  *Module declartion = assigne IIFE to variable, IIEF will return object, with public functions and propertis, for specific module
 * controller will connect 2 other modules together
 * 
 */


var budgetController = (function(){
    /**
     * Objects construction function for new Expense object
     * 
     * @param {*} id 
     * @param {*} description 
     * @param {*} value 
     */
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    /**
     * Calculate percentage for Expense
     * 
     * @param {*} totalIncome 
     */
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    /**
     * Get Percentage for Expense
     */
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    /**
     * Objects construction function for new Income object
     * 
     * @param {*} id 
     * @param {*} description 
     * @param {*} value 
     */
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    /**
     * Will store all data => all Expenses/Incomes objects and total values of incomes/expenses
     */
    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    /**
     * Calculates total based on type (Expenses or Incomes)
     * @param {*} type 
     */
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(item){
            sum += item.value;
        })

        data.total[type] = sum;
    };

    /**
     * Returns object of publicly accessible functions
     */
    return {
         /**
          * Add new item based on type (Expenses or Incomes object)
          * 
          * @param {*} type 
          * @param {*} des 
          * @param {*} val 
          */
        addItem: function(type, des, val) {
            var newItem, ID = 0;
            
            //Gets newItems ID which is last items ID + 1, if some elements ar available
            if (data.allItems[type].length) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            //Creates new item based on type
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        /**
         * Remove item from Expenses or Inocmes array
         * 
         * @param {*} type 
         * @param {*} id 
         */
        deleteItem: function(type, id) {
            var ids, index;

            //Maps over array and return New array of ID's
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        /**
         * Calculate budget
         * Total budget & percentage
         */
        calculateBudget: function() {

            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.total.inc - data.total.exp;
            
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        /**
         * Calculate percentage for each Expense object
         */
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(item){
                item.calcPercentage(data.total.inc);
            })
        },

        /**
         * Returns all percentages of Expenses
         */
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(item){
                return item.getPercentage();
            })

            return allPercentages;
        },

        /**
         * Returns budget data
         */
        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.total.inc,
                totalExp: data.total.exp
            }
        }
    };


})();

var UIController = (function(){
    //CSS Classes
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenceLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel:'.budget__title--month'
    };

    /**
     * Format numbers
     * 
     * @param {*} num 
     * @param {*} type 
     */
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    /**
     * 
     * Iterates over nodelist and executes callback function, that is passed in
     * 
     * @param {*} list 
     * @param {*} callback 
     */
    var nodeListForeach = function(list, callback) {
        for (var i = 0; i < list.length; i ++) {
            callback(list[i], i);
        }
    }


    /**
     * Returns object of public functions
     */
    return {
        /**
         * Gets Input values
         */
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        /**
         * Gets CSS Classes that are used in HTML
         */
        getDOMstrings: function() { //Exposing CSS Classes, so other controllers, can access
            return DOMStrings;
        },

        /**
         * Add list item to UI based on type
         * 
         * @param {*} obj 
         * @param {*} type 
         */
        addListItem: function(obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);//Insert new child into element container as last item
        },

        /**
         * 
         * Removes list element from UI
         * 
         * @param {*} selectorID 
         */
        deleteListItem: function(selectorID) {
            //Teachers example
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

            //Can be done also in this way. Not supported in AWESOME IE
            //document.getElementById(selectorID).remove();
        },

        /**
         * Reset all field values and add focus to first input
         */
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', '+ DOMStrings.inputValue); //Returns list, not an array

            //Calling Array.slice mothod with call function and returns fields ass array
            //Basicly converting NodeList to Array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current){
                current.value = '';
            });
            
            fieldsArr[0].focus();
        },

        /**
         * Updates UI based on current budget object structure
         * 
         * @param {*} obj 
         */
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenceLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        /**
         * 
         * Shows percentage for expenses list
         * 
         * @param {*} percentages 
         */
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            //Calling nodeListForeach  function with fields and callback function => callback function will receive  parameters
            nodeListForeach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'; 
                } else {
                    current.textContent = '-'; 
                }
            });
        },

        /**
         * Shows current Year & Month
         */
        displayMonth: function() {
            var year, month;
            var now = new Date();
            
            /**
             * Add new Date method to Date object
             */
            Date.prototype.getFullMonthName = function() {
                var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                return months[this.getMonth()];
            }

            year = now.getFullYear();

            month = now.getFullMonthName();

            document.querySelector(DOMStrings.dateLabel).textContent = year + " " + month;

        },
        
        /**
         * Toggle CSS classes
         */
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ', ' +
                DOMStrings.inputDescription + ', ' +
                DOMStrings.inputValue
            );

            nodeListForeach(fields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');


        }
    };
})();

/**
 * budgetController and UIController can be accessed without passing them,
 * but when name changes, will need to change everywhere,
 * where it is mentioned in controller IIFE => easier to pass them, and chnage only one place
 */
var controller = (function(budgetCtrl, UICtrl){

    /**
     * Adds event listeners for elements
     */
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();//Get CSS Classes, to add event listeners

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if (event.keyCode == 13 || event.which == 13) { //Which = for older browsers && other, that doesnt have keyCode
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }

    /**
     * Updates budget and UI
     */
    var updateBudget = function() {
        var budget;

        budgetCtrl.calculateBudget();

        budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);

    }

    /**
     * Calculates percentage and updates UI percentages
     */
    var updatePercentages = function() {
        var percentages;
        budgetCtrl.calculatePercentages();

        percentages = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(percentages);
    }

    /**
     * Control item adding to UI and, to budget data
     */
    var ctrlAddItem = function() {
        var input, newItem;
        
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
        
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            UICtrl.addListItem(newItem, input.type);
    
            UICtrl.clearFields();
    
            updateBudget();

            updatePercentages()
        }
    }

    /**
     * 
     * Deletes item from UI and also from budget data object
     * 
     * @param {*} event 
     */
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();
        }
    }

    return {
        /**
         * Initialize APP
         */
        init: function() {
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });

            setupEventListeners();

            UICtrl.displayMonth();
        }
    }

})(budgetController, UIController);

controller.init();