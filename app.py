from flask import Flask, render_template
import sys

app = Flask(__name__)

# Mock webbrowser to perfectly suppress the antigravity comic when launching the server visually
import webbrowser
original_open = webbrowser.open
webbrowser.open = lambda *args, **kwargs: None
try:
    import antigravity
    antigravity_status = "Online & Checked"
except Exception as e:
    antigravity_status = f"Failed ({e})"
finally:
    webbrowser.open = original_open

@app.route("/")
def dashboard():
    return render_template("index.html", status="Online (Production Ready)", module_status=antigravity_status)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
