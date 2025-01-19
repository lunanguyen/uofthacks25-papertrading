import yfinance as yf
from bson import ObjectId
from bson.json_util import dumps
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pandas as pd

app = Flask(__name__)

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
@app.route('/api/users/<string:id>', methods=['GET'])
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
        return dumps(found_user), 201
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
    return dumps(found_user), 200


# give id for user
@app.route('/api/users/<string:id>/buy', methods=['POST'])
def execute_buy(id):
    try:
        # Extract data from the request body
        data = request.get_json()
        ticker = data.get('ticker')
        date = data.get('date')
        quantity = data.get('quantity')

        # Validate input
        if not ticker or not date or quantity is None:
            return jsonify({"error": "Invalid input"}), 400

        # Get stock price
        prc = get_stock_price(ticker, date)['price']
        if prc == -1:
            return jsonify({"error": "Invalid ticker"}), 400

        # Fetch user details
        user = collection.find_one({"name": id})
        if not user:
            return jsonify({"error": "User not found"}), 404

        if prc * quantity > user['current_funds']:
            return jsonify({"error": "Not enough funds"}), 400

        # Update transaction history
        collection.update_one(
            {'name': id},
            {
                "$push": {
                    "transaction_history": {
                        'type': "buy",
                        'ticker': ticker,
                        'date': date,
                        'prc': prc,
                        'quantity': quantity
                    }
                }
            }
        )

        # Update portfolio
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
            {'name': id},
            {
                '$set': {
                    f'portfolio.{ticker}': {
                        'quantity': new_quantity,
                        'avg_price': new_average_price,
                        'pct_change': new_percentage_change
                    }
                }
            }
        )

        # Update current funds
        old_money = user['current_funds']
        collection.update_one(
            {'name': id},
            {
                '$set': {'current_funds': old_money - prc * quantity}
            }
        )

        return jsonify({"message": "Stock purchase successful"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        # end of transaction
    
@app.route('/api/users/<string:id>/sell', methods=['POST'])
def execute_sell(id):
    try:
        # Get the JSON data from the request
        data = request.get_json()
        ticker = data.get('ticker')
        date = data.get('date')
        quantity = data.get('quantity')

        # Validate input
        if not ticker or not date or quantity is None:
            return jsonify({"error": "Invalid input"}), 400

        # Get stock price
        prc = get_stock_price(ticker, date)['price']
        if prc == -1:
            return jsonify({"error": "Invalid ticker"}), 400

        # Fetch user details
        user = collection.find_one({"name": id})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if the user has enough stock to sell
        stock_update = user['portfolio'].get(ticker)
        if stock_update is None or stock_update['quantity'] < quantity:
            return jsonify({"error": "Not enough stock"}), 400

        # Update portfolio: decrease stock quantity
        current_quantity = stock_update['quantity']
        new_quantity = current_quantity - quantity
        current_avg_price = stock_update["avg_price"]
        new_percentage_change = (prc - current_avg_price) / current_avg_price * 100

        collection.update_one(
            {'name': id},
            {'$set': {
                f'portfolio.{ticker}': {
                    "quantity": new_quantity,
                    "avg_price": current_avg_price,
                    "pct_change": new_percentage_change
                }
            }}
        )

        # Add money to user's account (current funds)
        old_money = user['current_funds']
        collection.update_one(
            {'name': id},
            {
                '$set': {'current_funds': old_money + prc * quantity}
            }
        )

        # Record the transaction in history
        collection.update_one(
            {'name': id},
            {
                "$push": {
                    "transaction_history": {
                        'type': "sell",
                        'ticker': ticker,
                        'date': date,
                        'prc': prc,
                        'quantity': quantity
                    }
                }
            }
        )

        # Return a success response
        return jsonify({"message": "Stock sale successful"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    # finished

@app.route('/api/users/<string:id>/transactions', methods=['GET'])
def get_transaction_history(id):
    user = collection.find_one({"name" : id})
    return user["transaction_history"]

@app.route('/api/quest/<string:questId>', methods=['GET'])
def get_quest(questId):
    user = collection.find_one({"name" : questId})
    return dumps(user["quest"]), 200


def get_user_info(id):
    return collection.find_one({"name" : id})

def get_historical_data(ticker, start_date, end_date):
    # Create a Ticker object
    stock = yf.Ticker(ticker)

    # Fetch historical data for the specified date range
    historical_data = stock.history(start=start_date, end=end_date)

    return historical_data

@app.route('/api/marketdata/<string:ticker>', methods=['GET'])
# range should be an integer representing # of days, since we only have resolution down to days
# end_date: YYYY-MM-DD, date_range: number of days
def get_market_data(ticker):
    # Get query parameters
    end_date = request.args.get('end_date')
    date_range = request.args.get('date_range', type=int)

    if not end_date or date_range is None:
        return jsonify({"error": "Missing parameters"}), 400

    # Calculate start date based on date range
    start_date = calculate_start_date(end_date, date_range)

    # Fetch historical market data
    data = get_historical_data(ticker, start_date, end_date)

    # Convert DataFrame to dictionary (or list of dictionaries) to be JSON serializable
    data_dict = data.to_dict(orient='records')

    return jsonify(data_dict)

@app.route("/api/members")
def members():
    return {"members": ["Member1", "Member2", "Member3", "Member4"]}

if __name__ == '__main__':
    app.run(debug=True)

check_for_id("Bob")
#execute_buy('Bob', 'AAPL', '2023-11-06', 500)

#execute_buy('Bob', 'AAPL', '2023-11-11', 100)

#execute_buy('Bob', 'AAPL', '2024-12-20', 10000000000)

#execute_sell('Bob', 'AAPL', '2024-12-26', 11)

#print(get_transaction_history('Bob'))
#print(get_user_info("Bob"))
#check_for_id("Bob")
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
