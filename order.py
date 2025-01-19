import yfinance as yf
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Get MongoDB URI from the environment variables
MONGODB_URI = os.getenv("MONGODB_URI")

# Connect to MongoDB
client = MongoClient(MONGODB_URI)

# Access the database
db = client["test"]

# Access a collection
collection = db["test_collection"]

# input: stock ticker and a date
# output: the stock's opening price on that date
def get_stock_price(ticker: str, date: str):
    # Download historical stock data
    stock_data = yf.download(ticker, period='1d', start=date, rounding=True)

    # Check if data exists for the given date
    if stock_data.empty:
        return { 'price' : -1 } #f"No data available for {ticker} on {date}."
    
    # Extract and return the closing price for the specified date
    return { 'price' : stock_data['Open'].iloc[0].iloc[0] }


def calculate_start_date(end_date_str, date_range):
    # Convert the end date string to a datetime object
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    
    # Calculate the start date by subtracting the date range (in days)
    start_date = end_date - timedelta(days=date_range)
    
    # Convert the start date back to a string in 'YYYY-MM-DD' format
    start_date_str = start_date.strftime('%Y-%m-%d')
    
    return start_date_str

def are_consec_dates(datetime1, datetime2):
    date1 = datetime1.date()
    date2 = datetime2.date()
    return date2 == date1 + timedelta(days=1)

def get_login_bonus(current_streak):
    if current_streak < 5:
        return 100
    elif current_streak < 10:
        return 200
    elif current_streak < 30:
        return 500
    else:
        return 10000
    
# iterates through each stock in the portfolio, and updates percentage change to match the day
# this will be called every time we login, just to make sure that we are up to date
def update_pct_change(id, date):
    user = collection.find_one({"name" : id})
    stock_update = user['portfolio']
    print(stock_update)
    for ticker, data in stock_update.items():
        prc = get_stock_price(ticker, date)['price']
        new_pct_change = (prc - data['avg_price']) / data['avg_price'] * 100
        collection.update_one(
            {'name' : id},
                {'$set' : {
                    f'portfolio.{ticker}' : {
                        "quantity" : data['quantity'], "avg_price" : data['avg_price'], "pct_change" : new_pct_change
                    }
                }
            }
        )

def get_portfolio_value(id, date):
    user = collection.find_one({"name" : id})
    stock_update = user['portfolio']
    val = user['current_funds']
    for ticker in stock_update:
        prc = get_stock_price(ticker, date)['price']
        val += prc * stock_update[ticker].get('quantity')
    return val

    

def add_days_to_datetime(original_datetime, days):
    # Add the specified number of days to the original datetime
    future_datetime = original_datetime + timedelta(days=days)
    return future_datetime

# only call this if date is greater than or equal to end date --> we will query the end date price if we are over
def complete_quest(id, cur_date):
    user_info = collection.find_one({"name" : id})
    end_date = user_info["quest"].get("end_date")
    portfolio_val = get_portfolio_value(id, end_date.strftime('%Y-%m-%d'))
    if (portfolio_val - user_info["quest"].get("portfolio_value_at_start")) / user_info["quest"].get("portfolio_value_at_start") * 100 >= 5:
        # increase the number of quests completed, we can also do something else here
        collection.update_one(
            {"name" : id},
            {
                "$set" : {
                    "quests_completed" : user_info["quests_completed"] + 1
                }
            }
        )
    # reset the quest --> new quest but same thing for now
    collection.update_one(
            {"name" : id},
            {
                "$set" : {
                    "quest" : {
                        "end_date" : add_days_to_datetime(cur_date, days=30),  
                        "quest_name" : "growth",
                        "objective" : 5, # in percentage
                        "portfolio_value_at_start" : user_info["portfolio_value"]
                    }
                }
            }
        )


# input: an id 
# checks the db for list of users
# if it exists, return the user information in dictionary format
# if it does not exist, create user information and return in dictionary format

# this is when login happens, so we will simply check the login streak and stuff like that
def check_for_id(id): 
    found_user = collection.find_one({"name": id})
    cur_date = datetime.now()
    if found_user is None:
        # create a new user
        document = {
            "name" : id,
            "portfolio" : {},
            "transaction_history" : [],
            "current_funds" : 100000,
            "portfolio_value" : 100000,
            "current_streak" : 1,
            "last_login" : datetime.now(),
            "quests_completed" : 0,
            # everyone starts off with a growth quest
            "quest" : {
                    "end_date" : add_days_to_datetime(cur_date, days=30),  
                    "quest_name" : "growth",
                    "objective" : 5, # in percentage
                    "portfolio_value_at_start" : 100000
                }
            }
        collection.insert_one(document)
        found_user = collection.find_one({"name" : id})
    else:
        # returning user
        new_login_time = datetime.now()

        # if logged in consecutive dates (we continue the streak)
        if are_consec_dates(found_user['last_login'], new_login_time) == True:
            collection.update_one(
                {'name' : id},
                    {
                        '$set' : {
                              'current_streak' : found_user['current_streak'] + 1,
                              'last_login' : new_login_time,
                              'current_funds' : found_user['current_funds'] + get_login_bonus(found_user['current_streak'] + 1)
                              }
                    }
            )
        # logged in non consecutive dates
        elif found_user['last_login'].date() != new_login_time.date():
            collection.update_one(
                {'name' : id},
                    {
                        '$set' : {
                              'current_streak' : 1,
                              'last_login' : new_login_time,
                              'current_funds' : found_user['current_funds'] + get_login_bonus(1)
                              }
                    }
            )
        # otherwise logged in on the same date
        else:
            collection.update_one(
                {'name' : id},
                    {
                        '$set' : {
                              'last_login' : new_login_time,
                              }
                    }
            )
        # update the percentage change for the stocks
        update_pct_change(id, found_user['last_login'].strftime('%Y-%m-%d'))
        # update the unrealized value for the stocks
        #print(found_user['last_login'].strftime('%Y-%m-%d'))
        collection.update_one(
            {'name' : id},
            {'$set' : {
                'portfolio_value' : get_portfolio_value(id, found_user['last_login'].strftime('%Y-%m-%d'))
                }
            }
        )
        # complete quest if we need to
        if cur_date >= found_user["quest"].get("end_date"):
            complete_quest(id, cur_date)
        return found_user


# give id for user
@app.route('/users/<string:username>/buy', methods=['POST'])
def execute_buy(id, ticker, date, quantity):
    #try:
        prc = get_stock_price(ticker, date)['price'] # this should go into try except but it doesnt work
        if prc == -1:
            # handle error, although this shouldn't happen
            raise Exception("Ticker Invalid")
        user = collection.find_one({"name" : id})
        if prc * quantity > user['current_funds']:
            # not enough money available
            raise Exception("Not enough funds")
        # else we can execute the trade, so we want to add this to transaction history and also add to portfolio

        # add to transaction history

        queryid = { 'name' : id }
        newvalues = { "$push" : {"transaction_history" : {'type' : "buy", 'ticker' : ticker, 'date' : date, 'prc' : prc, 'quantity' : quantity}}}
        collection.update_one(queryid, newvalues)

        # add to portfolio
        stock_update = user['portfolio'].get(ticker)

        if stock_update is None:
            new_quantity = quantity
            new_average_price = prc
            new_percentage_change = 0
        else:
            current_quantity = stock_update['quantity']
            current_average_price = stock_update['avg_price']
    
            new_quantity = current_quantity + quantity
            new_average_price = (current_quantity * current_average_price + quantity * prc) / new_quantity
            new_percentage_change = (prc - new_average_price) / new_average_price * 100

        collection.update_one(
            {'name' : id},
            {
                '$set': {f'portfolio.{ticker}': {'quantity' : new_quantity, 'avg_price' : new_average_price, 'pct_change' : new_percentage_change}}
            }
        )

        # subtract amount of possible money from portfolio
        old_money = user['current_funds']
        collection.update_one(
            {'name' : id},
            {
                '$set' : {'current_funds' : old_money - prc * quantity }
            }
        )

        # end of transaction
        # no need to return anything?
        # return 0
    
@app.route('/users/<string:username>/sell', methods=['POST'])
def execute_sell(id, ticker, date, quantity):
    prc = get_stock_price(ticker, date)['price']

    if prc == -1:
        # handle error, although this shouldn't happen
        raise Exception("Ticker Invalid")
    
    user = collection.find_one({"name" : id})
    stock_update = user['portfolio'].get(ticker)
    # we don't have enough stock
    if stock_update is None or stock_update['quantity'] < quantity:
         raise Exception("Not enough stock")
    # otherwise, we should have enough, so sell the stock
    # problem is how do we revert the computation of percentage change?
    # we have to look at buy orders? not sure how much the average price will decrease
    # "realized" value --> so we don't really remove it, since it is percentage change from this stock?
    # no need to calculate new average price, or percentage change, we just need to change quantity
    current_quantity = stock_update['quantity']
    new_quantity = current_quantity - quantity
    current_avg_price = stock_update["avg_price"]
    new_percentage_change = (prc - current_avg_price) / current_avg_price * 100
    collection.update_one(
        {'name' : id},
        {'$set' : {
            f'portfolio.{ticker}' : {
                "quantity" : new_quantity, "avg_price" : current_avg_price, "pct_change" : new_percentage_change
                }
            }
        }
    )
    # we should add the money to our account
    old_money = user['current_funds']
    collection.update_one(
        {'name' : id},
        {
            '$set' : {'current_funds' : old_money + prc * quantity }
        }
    )
    # we should record this sale in our transaction history
    collection.update_one(
        {'name' : id},
        {
            "$push" : {
                "transaction_history" :
                {'type' : "sell", 'ticker' : ticker, 'date' : date, 'prc' : prc, 'quantity' : quantity}
            }
        }
    )
    # finished

@app.route('/users/<string:username>/transactions', methods=['GET'])
def get_transaction_history(id):
    user = collection.find_one({"name" : id})
    return user["transaction_history"]

@app.route('/users/<string:username>', methods=['GET'])
def get_user_info(id):
    return collection.find_one({"name" : id})

def get_historical_data(ticker, start_date, end_date):
    # Create a Ticker object
    stock = yf.Ticker(ticker)

    # Fetch historical data for the specified date range
    historical_data = stock.history(start=start_date, end=end_date)

    return historical_data

@app.route('/marketdata/<string:ticker>', methods=['GET'])
# range should be an integer representing # of days, since we only have resolution down to days
def get_market_data(ticker, end_date, date_range):
    start_date = calculate_start_date(end_date, date_range)
    data = get_historical_data(ticker, start_date, end_date)
    return data

#check_for_id("Bob")
#execute_buy('Bob', 'AAPL', '2023-11-06', 500)

#execute_buy('Bob', 'AAPL', '2023-11-11', 100)

#execute_buy('Bob', 'AAPL', '2024-12-20', 10000000000)

#execute_sell('Bob', 'AAPL', '2024-12-26', 11)

#print(get_transaction_history('Bob'))
#print(get_user_info("Bob"))
check_for_id("Bob")
#execute_buy("Bob", "NVDA", "2022-12-12", 1000)
#execute_buy("Bob", "NVDA", "2022-09-10", 500)
#execute_sell("Bob", "NVDA", "2024-07-07", 15)

#print(get_market_data('NVDA', '2023-01-01', 30))


# Example usage
# ticker = 'AAPL'  # Stock ticker (e.g., Apple)
# date = '2023-01-27'  # Date (format: 'YYYY-MM-DD')

# price = get_stock_price(ticker, date)
# print(price)

# - add_to_portfolio() interact with the db, add to the stock portfolio
# - remove_from_portfolio() interact with the db, remove from the stock portfolio

# - add user into db --> upon first login
# - create user quests --> should be a part of the user profile, probably
# - get user rank --> part of user profile
# - query past stock performance --> to do the analytics
#   - return best performing stock
#   - return worst performing stock

# - we should be able to get the whole user profile in one json file, and then the frontend can process whatever information they want to do with it
# - so basically there shoud be a get user info function
#   - this should query everything in the database and then return that as a json file
#   - so we should worry about how the users are stored in the database --> discuss with luna tomorrow

# - we should also be able to get all the stock information, so that the frontend can display it --> really easy with yfinance, no need for db
