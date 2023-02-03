import React, { useEffect, useState } from 'react'
import { Col, Row } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ApiClient from '../../api/ApiRoutes';

export const Gallery = ({ id, name }) => {

  //data of all images
  const [data, setData] = useState([]);
  const [newImage, setNewImage] = useState([]);
  const [updatedBackgroundImage, setUpdatedBackgroundImage] = useState("");
  const [removeImage, setRemoveImage] = useState("");

  useEffect(() => {
    const getResult = async () => {
      //get all images of the business from mongodb
      ApiClient.getGallery(id)
        .then((res) => setData(res))
        .catch((err) => console.log(err));
    };
    getResult();
  }, [id]);

  //Admin Permissions
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleClose2 = () => setShow2(false);
  const handleShow2 = (id) => {
    setRemoveImage(id);
    setShow2(true);
  }
  const getUserData = JSON.parse(localStorage.getItem('token'));

  const isAdmin = () => {
    if (getUserData) {
      return getUserData.business.includes(id);
    }
    return false;
  }

  const handleOpenWidget = async () => {
    var myWidget = window.cloudinary.createUploadWidget({
      cloudName: 'dk5mqzgcv',
      uploadPreset: 'xw93prxe'
    }, (error, result) => {
      if (!error && result && result.event === "success") {
        console.log('Done! Here is the image info: ', result.info);
        setNewImage({ id: result.info.public_id, url: result.info.url });
      }
    }
    )

    //open widget
    myWidget.open();
  }

  const handleOpenWidgetForBackground = async () => {
    var myWidget = window.cloudinary.createUploadWidget({
      cloudName: 'dk5mqzgcv',
      uploadPreset: 'xw93prxe'
    }, (error, result) => {
      if (!error && result && result.event === "success") {
        console.log('Done! Here is the image info: ', result.info);
        setUpdatedBackgroundImage(result.info.url);
      }
    }
    )

    //open widget
    myWidget.open();
  }

  const uploadImage = async () => {

    //send request to server for upload new image
    if (newImage.length !== 0) {
      ApiClient.addNewImage(id, newImage)
        // await axios.put(`https://facework-server-production.up.railway.app/api/business/${id}/gallery`, newImage)
        .then((res) => {
          console.log(res.data)
          setData(oldArray => [...oldArray, newImage]);
          handleClose()
        })
        .catch((err) => console.log(err));
    }

    //update background image
    if (updatedBackgroundImage !== "") {
      ApiClient.updateBackgroundImage(id, updatedBackgroundImage)
        // await axios.put(`https://facework-server-production.up.railway.app/api/business/${id}/background`, { backgroundPicture: updatedBackgroundImage })
        .then((res) => {
          console.log(res.data)
          window.location.reload(false);
        })
        .catch((err) => console.log(err));
    }

  }

  const handleRemoveImage = async () => {

    ApiClient.removeImageFromGallery(id, removeImage)
      // await axios.delete(`https://facework-server-production.up.railway.app/api/business/${id}/gallery`,
      //   { data: { id: removeImage } })
      .then((res) => {
        const newArray = data.filter(obj => obj.id !== removeImage);
        setData(newArray)
        handleClose2()
      })
      .catch((err) => console.log(err));
  }

  return (

    <>
      {
        isAdmin() ?
          <>
            <Button variant="btn btn-warning" onClick={handleShow}>
              <b>Admin Permissions</b>
            </Button>
            <hr></hr>
          </>
          :
          null
      }
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <h5>Admin Permissions</h5>
        </Modal.Header>
        <Modal.Body>
          {/* <br></br> */}
          {/* <input type="file" filename="image"
            onChange={handleImage} /> */}
          <h6>Select a photo to add to the gallery:</h6>
          <div id='upload-widget' className='cloudinary-button' onClick={() => handleOpenWidget()}>
            Choose file
          </div>
          <br /><br />
          <h6>Update background photo:</h6>
          <div id='upload-widget' className='cloudinary-button' onClick={() => handleOpenWidgetForBackground()}>
            Choose file
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="btn btn-success" onClick={uploadImage}>Upload</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={show2}
        onHide={handleClose2}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <h5>Remove image?</h5>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose2}>
            Close
          </Button>
          <Button variant="btn btn-danger" onClick={handleRemoveImage}>Remove</Button>
        </Modal.Footer>
      </Modal>

      <Row>
        {
          data.map((singleData, i) => {
            return (
              <Col size={12} sm={6} md={4}>
                <div className="proj-imgbx">
                  <img src={singleData.url} alt={i} width="450" height="250" />
                  {
                    isAdmin() ?
                      <button class="btn btn-danger btn-delete" onClick={() => handleShow2(singleData.id)}>Delete</button>
                      :
                      null
                  }
                </div>
              </Col>
            )
          })
        }
      </Row>

    </>
  )
}
