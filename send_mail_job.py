import smtplib
import json
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email():
    # Nom du fichier de configuration
    config_file = 'config.json'

    print(f"--- Démarrage du script d'envoi d'email ReguTrack ---")
    
    # 1. Chargement de la configuration
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
            sender_email = config.get('email')
            password = config.get('password')
            receiver_email = config.get('receiver_email')
            
            if not sender_email or not password:
                print("ERREUR DE CONFIG : 'email' ou 'password' manquant dans config.json")
                return
            
            if not receiver_email:
                receiver_email = sender_email # S'envoie à soi-même par défaut si non spécifié
                print(f"INFO : Pas de destinataire spécifié, envoi à l'expéditeur ({sender_email})")
                
    except FileNotFoundError:
        print(f"ERREUR FATALE : Le fichier {config_file} est introuvable.")
        print("Veuillez créer ce fichier avec vos identifiants (voir exemple).")
        return
    except json.JSONDecodeError:
        print(f"ERREUR FATALE : Le fichier {config_file} n'est pas un JSON valide.")
        return

    # Configuration du serveur Office 365
    smtp_server = "smtp.office365.com"
    smtp_port = 587

    # Préparation du message
    subject = "ReguTrack : Test de Notification"
    body = """Bonjour,

Ceci est un message de test envoyé par l'application ReguTrack.
Si vous lisez ce message, la connexion SMTP Office 365 est correctement configurée.
L'encodage des accents (é, à, ç, ê) fonctionne correctement.

Cordialement,
Votre Assistant ReguTrack Local
"""

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    # Encodage UTF-8 explicite pour le corps du texte
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        print(f"Connexion au serveur {smtp_server} sur le port {smtp_port}...")
        
        # Initialisation de la connexion
        server = smtplib.SMTP(smtp_server, smtp_port)
        
        # Optionnel : Décommentez la ligne suivante pour voir TOUT le dialogue réseau (très verbeux)
        # server.set_debuglevel(1)
        
        # Séquence spécifique Office 365 (CRITIQUE)
        print("1. Envoi de la commande EHLO...")
        server.ehlo()
        
        print("2. Activation du chiffrement TLS (STARTTLS)...")
        server.starttls()
        
        print("3. Renvoi de la commande EHLO (post-TLS)...")
        server.ehlo()
        
        print(f"4. Authentification du compte : {sender_email}...")
        server.login(sender_email, password)
        
        print(f"5. Envoi de l'email à {receiver_email}...")
        server.sendmail(sender_email, receiver_email, msg.as_string())
        
        print("6. Fermeture de la connexion...")
        server.quit()
        
        print("\n>>> SUCCÈS : Email envoyé correctement ! <<<")
        
    except smtplib.SMTPAuthenticationError as e:
        print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("ERREUR D'AUTHENTIFICATION SMTP")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("ERREUR : Mot de passe incorrect ou l'option SMTP est bloquée par l'informatique.")
        print("\nCauses probables :")
        print("  - Mot de passe Windows/Outlook erroné dans config.json.")
        print("  - L'authentification SMTP (SMTP AUTH) est désactivée sur votre tenant Office 365.")
        print(f"\nDétails techniques serveur : {e}")
        
    except Exception as e:
        print(f"\n!!! ERREUR INATTENDUE !!!")
        print(f"Type d'erreur : {type(e).__name__}")
        print(f"Message : {e}")

if __name__ == "__main__":
    send_email()