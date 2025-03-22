import os
import sendgrid
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import certifi  # Add this line
import ssl  # Add this line

# Load environment variables
load_dotenv()

# Initialize SendGrid
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)

# Set up SSL context to use certifi's certificate bundle
ssl_context = ssl.create_default_context(cafile=certifi.where())  # Add this line
sg.client.https_verify_mode = ssl_context  # Add this line

def send_email_notification(email, message):
    from_email = "sharonmctsai@gmail.com"  # Replace with your sender email
    to_email = email
    subject = " Service Reminder"
    content = f"Your service is due. {message}"
    
    mail = Mail(from_email, to_email, subject, content)
    try:
        print(f"Sending email to {to_email} with subject: {subject}")
        response = sg.send(mail)
        print(f"Email sent to {to_email}, status code: {response.status_code}")
        print(f"Response body: {response.body}")
        print(f"Response headers: {response.headers}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# Test the function
if __name__ == '__main__':
    if send_email_notification("sharonmctsai@gmail.com", "This is a test email from SendGrid!"):
        print("Email sent successfully!")
    else:
        print("Failed to send email.")