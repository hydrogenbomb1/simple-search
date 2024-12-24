from flask import Flask, send_from_directory, request
import os

app = Flask(__name__)

# Set the upload folder to the current directory
UPLOAD_FOLDER = os.getcwd()  # Current working directory
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Route to download a file
@app.route('/download/<filename>')
def download_file(filename):
    try:
        # Use send_from_directory to send the file for download
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)
    except FileNotFoundError:
        return "File not found", 404

@app.route('/')
def index():
    return '''
        <html>
            <body>
                <h1>Simple File Search</h1>
                <form action="/search" method="get">
                    <input type="text" name="q" placeholder="Search for files">
                    <button type="submit">Search</button>
                </form>
            </body>
        </html>
    '''

# Search route to show results
@app.route('/search')
def search():
    query = request.args.get('q', '')
    results = []

    # Search for files in the current directory
    for file in os.listdir(app.config['UPLOAD_FOLDER']):
        if query.lower() in file.lower():
            results.append(file)

    # Generate HTML for the search results with download links
    result_html = ''.join([f'<li><a href="/download/{file}">{file}</a></li>' for file in results])

    return f'''
        <html>
            <body>
                <h1>Search Results for: "{query}"</h1>
                <ul>{result_html}</ul>
                <a href="/">Go Back</a>
            </body>
        </html>
    '''

if __name__ == '__main__':
    app.run(debug=True)
