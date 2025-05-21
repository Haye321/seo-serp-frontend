import React, { useState, useRef } from "react";
import axios from "axios";
import { FaSearchPlus, FaSearchMinus, FaDownload } from "react-icons/fa";
import "./screenshots.css";

function Screenshots() {
  // Static list of existing images in public/screenshots
  const existingImages = [
    { name: "image1.png", url: "/screenshots/google_maps_1739970621001.png" },
    { name: "image2.png", url: "/screenshots/google_maps_1739971888903.png" },
    { name: "image3.png", url: "/screenshots/google_maps_1739972068081.png" },
    { name: "image4.png", url: "/screenshots/google_maps_1739972242112.png" },
    { name: "image5.png", url: "/screenshots/google_maps_1739972828801.png" },
    { name: "image6.png", url: "/screenshots/google_maps_1739973120920.png" },
    { name: "image7.png", url: "/screenshots/google_maps_1739973168952.png" },
    { name: "image8.png", url: "/screenshots/google_maps_1739973204199.png" },
    { name: "image9.png", url: "/screenshots/perplexity_1739970612521.png" },
    { name: "image10.png", url: "/screenshots/perplexity_1739972235098.png" },
    { name: "image11.png", url: "/screenshots/perplexity_1739972819420.png" },
    { name: "image12.png", url: "/screenshots/perplexity_1739973113951.png" },
    { name: "image13.png", url: "/screenshots/perplexity_1739973168144.png" },
    { name: "image14.png", url: "/screenshots/perplexity_1739973197416.png" },
  ];

  const [images, setImages] = useState(existingImages); // Initialize with existing images
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image to view
  const [zoomLevel, setZoomLevel] = useState(1); // State for zoom level (1x by default)
  const [selectedFiles, setSelectedFiles] = useState([]); // State to store selected file names
  const fileInputRef = useRef(null); // Ref to access the hidden file input

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

    // Validate file types
    const invalidFiles = files.filter(
      (file) => !validImageTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setError("Please upload valid image files (JPEG, PNG, GIF).");
      return;
    }

    // Update selected files display
    setSelectedFiles(files.map((file) => file.name));

    // Clear error and prepare to upload
    setError(null);
    setUploading(true);

    try {
      // Create FormData to send files to the backend
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      // Send images to the backend API
      const response = await axios.post("/api/upload-screenshots", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Assuming the backend returns the filenames of the uploaded images
      const uploadedImages = response.data.files.map((filename) => ({
        name: filename,
        url: `/screenshots/${filename}`,
      }));

      // Add the newly uploaded images to the state
      setImages((prevImages) => [...prevImages, ...uploadedImages]);
      setSelectedFiles([]); // Clear selected files after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the file input
      }
    } catch (err) {
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Open the modal with the selected image
  const openImageModal = (image) => {
    console.log("Opening modal for image:", image.name);
    setSelectedImage(image);
    setZoomLevel(1); // Reset zoom level when opening a new image
  };

  // Close the modal
  const closeImageModal = () => {
    console.log("Closing modal");
    setSelectedImage(null);
    setZoomLevel(1); // Reset zoom level when closing the modal
  };

  // Zoom in (increase scale)
  const zoomIn = () => {
    console.log("Zooming in, current zoom level:", zoomLevel);
    setZoomLevel((prev) => Math.min(prev + 0.5, 3)); // Max zoom level of 3x
  };

  // Zoom out (decrease scale)
  const zoomOut = () => {
    console.log("Zooming out, current zoom level:", zoomLevel);
    setZoomLevel((prev) => Math.max(prev - 0.5, 1)); // Min zoom level of 1x
  };

  // Download the image
  const handleDownload = async () => {
    console.log("Downloading image:", selectedImage?.name);
    if (!selectedImage) return;

    try {
      // Fetch the image as a blob
      const response = await fetch(selectedImage.url);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedImage.name; // Use the image name as the downloaded file name
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image:", err);
      setError("Failed to download image. Please try again.");
    }
  };

  // Trigger the hidden file input
  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className="container d-flex justify-content-center">
        <div className="screenshots-container">
          <h2 className="text-center mb-4 heading-upload">Upload Screenshots</h2>
          <div className="mb-4">
            <div className="form-label">Select Images</div>
            {/* Custom input wrapper */}
            <div className={`custom-file-input ${uploading ? "disabled" : ""}`}>
              <button
                type="button"
                className="choose-file-btn"
                onClick={handleChooseFileClick}
                disabled={uploading}
              >
                Choose Files
              </button>
              <span className="file-name-display">
                {selectedFiles.length > 0
                  ? selectedFiles.join(", ")
                  : "No files chosen"}
              </span>
              {/* Hidden file input */}
              <input
                type="file"
                id="image-upload"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/jpeg,image/png,image/gif"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {/* Hidden label for screen readers */}
              <label htmlFor="image-upload" className="visually-hidden">
                Upload images (JPEG, PNG, GIF)
              </label>
            </div>
          </div>
          {uploading && (
            <div className="text-center mb-3">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Uploading...</span>
              </div>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>

      <div className="container">
        {images.length > 0 && (
          <div className="image-gallery">
            <h3 className="text-center mb-4 heading-upload">Screenshots Gallery</h3>
            <div className="row">
              {images.map((image, index) => (
                <div key={index} className="col-md-4 mb-4">
                  <div className="card">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg"; // Fallback image if the URL fails to load
                      }}
                      onClick={() => openImageModal(image)} // Open modal on click
                    />
                    <div className="card-body">
                      <p className="card-text text-center">{image.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for viewing the selected image */}
      {selectedImage && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="imageModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="imageModalLabel">
                  {selectedImage.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeImageModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="img-fluid zoomable-image"
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.3s ease", // Smooth zoom transition
                  }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn zoom-in"
                  onClick={zoomIn}
                  disabled={zoomLevel >= 3} // Disable zoom-in at max level
                >
                  <FaSearchPlus />
                </button>
                <button
                  type="button"
                  className="btn zoom-out"
                  onClick={zoomOut}
                  disabled={zoomLevel <= 1} // Disable zoom-out at min level
                >
                  <FaSearchMinus />
                </button>
                <button
                  type="button"
                  className="btn download"
                  onClick={handleDownload}
                >
                  <FaDownload /> Download
                </button>
                <button
                  type="button"
                  className="btn close-btn"
                  onClick={closeImageModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal backdrop */}
      {selectedImage && (
        <div className="modal-backdrop fade show" onClick={closeImageModal}></div>
      )}
    </>
  );
}

export default Screenshots;