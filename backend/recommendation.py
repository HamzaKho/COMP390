from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

def fetch_user_preferences():
    """Fetch user preferences from the database."""
    user_preferences = {}
    try:
        conn = mysql.connector.connect(
            host= "localhost",
            user= "root",
            password= "",
            database= "comp390",
        )
        cursor = conn.cursor(dictionary=True)
        query = "SELECT user_id, game_id, preference FROM user_game_preferences"
        cursor.execute(query)
        rows = cursor.fetchall()

        for row in rows:
            user_id = row['user_id']
            game_id = row['game_id']
            preference = row['preference']
            if user_id not in user_preferences:
                user_preferences[user_id] = {}
            user_preferences[user_id][game_id] = preference
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
    return user_preferences

def get_game_recommendations(user_id, user_preferences, top_n=6):
    print(f"User ID: {user_id}")
    print(f"User Preferences: {user_preferences}")
    #generate recommemndations

    def preference_to_numeric(pref):
        return 1 if pref == 'like' else 0
    
    games = list({game for prefs in user_preferences.values() for game in prefs})
    user_ids = list(user_preferences.keys())

    if user_id not in user_ids:
        return []

    matrix = np.array([
        [preference_to_numeric(prefs.get(game, 'dislike')) for game in games]
        for prefs in user_preferences.values()
    ])

    user_index = user_ids.index(user_id)
    similarities = cosine_similarity([matrix[user_index]], matrix)[0]
    similarities[user_index] = -1
    if max(similarities) == -1:
        return []
    
    similar_user_index = np.argmax(similarities)

    similar_user_prefs = user_preferences[user_ids[similar_user_index]]
    current_user_prefs = user_preferences[user_id]
    recommendations = [game for game, liked in similar_user_prefs.items() if preference_to_numeric(liked) and game not in current_user_prefs]
    print(f"User ID: {user_id}")
    print(f"User Preferences: {user_preferences}")
    print(f"Recommended Games: {recommendations}")
    return recommendations[:top_n]

@app.route('/recommendations/<int:user_id>', methods=['GET'])
def recommendations(user_id):
    """API endpoint to get game recommendations for a user."""
    user_preferences = fetch_user_preferences()
    recommended_games = get_game_recommendations(user_id, user_preferences)
    return jsonify(recommended_games)

if __name__ == '__main__':
    app.run(debug=True)
