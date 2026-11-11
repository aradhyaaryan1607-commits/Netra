# VISIONMATE AI — GitHub Pages starter

This is a browser-based prototype intended to be uploaded to a GitHub repository and hosted with GitHub Pages.

## Included in this starter
- Phone camera selection using `getUserMedia` (works on HTTPS, such as GitHub Pages).
- ESP32-CAM stream URL input (works if the stream format and browser/network security settings allow it).
- COCO-SSD object detection in the browser using TensorFlow.js, with bounding boxes and labels.
- Approximate left / ahead / right position from the object's horizontal image position.
- A rough visual-size proximity indicator. **It is not a calibrated distance measurement.**
- Local reference-picture libraries for obstacles, products, and currency using IndexedDB.
- Product and currency photo capture and browser voice announcements.

## Important limitations
This is a starter prototype, not the complete feature set originally described.
- Uploaded obstacle reference images are stored but are **not yet matched** against live detections.
- Product recognition, OCR of manufacturing/expiry dates, and currency recognition are **not automated yet**. Product/currency capture currently saves a photo to your device for manual comparison.
- The basic COCO-SSD model recognizes a fixed set of common object classes. It cannot identify every possible object.
- A normal RGB camera cannot reliably calculate real-world distance from a single image without calibration, known object dimensions, stereo/depth hardware, or an external sensor.
- Wall detection within 0.5 m is not implemented as a reliable safety feature. Consider a ToF/ultrasonic sensor for measured close-range distance.
- Do not use this experimental website as the sole aid for walking, navigation, or avoiding hazards.

## Publish with GitHub Pages (Android-friendly)
1. Sign in at https://github.com and create a new repository, e.g. `visionmate-ai`.
2. Extract this ZIP on your device.
3. Upload the contents of the extracted `visionmate-ai` folder to the repository root. `index.html` must be at the root, not inside another nested folder.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Choose branch **main** and folder **/(root)**, then Save.
7. Wait for the Pages URL to appear. Open it in Chrome and allow camera permission.

## ESP32-CAM
Enter the stream URL served by your ESP32-CAM firmware. Common firmware setups expose an MJPEG stream endpoint such as `http://DEVICE-IP:81/stream`, but the exact URL depends on your firmware. The phone and ESP32 should generally be on the same Wi-Fi network. HTTPS pages may block insecure HTTP streams (mixed content), and some streams require CORS support. If the browser blocks the stream, the ESP32 firmware or hosting arrangement needs adjustment.

## Data storage
Reference images and details are stored in IndexedDB in the current browser profile on the current device. They are not automatically synced to GitHub or another device. Clearing browser site data may erase them. Keep backup copies of your original images and product details.

## Internet requirement
The TensorFlow.js and COCO-SSD libraries are loaded from public CDNs, so an internet connection is needed to load the detection model.
