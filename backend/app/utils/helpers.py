import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    """
    Check if file extension is allowed
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
def save_image(file, upload_folder, max_size=(800, 800)):
    """
    Save and resize an uploaded image
    
    Args:
        file: FileStorage object from request.files
        upload_folder: Directory to save the image
        max_size: Tuple of (width, height) for maximum dimensions
    
    Returns:
        filename: The saved filename, or None if failed
    """
    if not file or not allowed_file(file.filename):
        return None
    
    # Create upload folder if it doesn't exist
    os.makedirs(upload_folder, exist_ok=True)
    
    # Generate unique filename
    original_filename = secure_filename(file.filename)
    file_ext = original_filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    filepath = os.path.join(upload_folder, unique_filename)
    
    try:
        # Open and resize image
        image = Image.open(file)
        
        # Convert RGBA to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
            image = background
        
        # Resize maintaining aspect ratio
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save image
        image.save(filepath, quality=85, optimize=True)
        
        return unique_filename
    except Exception as e:
        print(f"Error saving image: {e}")
        return None