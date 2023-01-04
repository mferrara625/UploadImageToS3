import React, { useState } from 'react';
import AWS from 'aws-sdk';

const S3_BUCKET = 'bucket';
const REGION = 'region';

function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
}


AWS.config.update({
    accessKeyId: 'access',
    secretAccessKey: 'secret',
    region: REGION
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
})

const UploadImageToS3WithNativeSdk = () => {

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0]);
    }

    const uploadFile = async (file) => {


        const signedUrlExpireSeconds = 60;
        myBucket.getSignedUrl('putObject', {
            Key: file.name,
            ContentType: file.type,
            // Conditions: [["content-length-range", 100, 10000000]],
            Expires: signedUrlExpireSeconds
        }, (err, url) => {
            fetch(url, {
                method: 'PUT',
                body: file
            }).then((res) => {
                myBucket.getSignedUrl('getObject', {
                    Key: file.name,
                    Expires: signedUrlExpireSeconds
                }, (err, res) => {
                    console.log('the final download url is ', res);
                })
            })
        });
        
        await timeout(2000);

        const client = new AWS.Rekognition();
        const params = {
            Image: {
                S3Object: {
                    Bucket: S3_BUCKET,
                    Name: file.name
                },
            },
            Attributes: ['ALL']
        }
        client.detectFaces(params, function (err, response) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                console.log(response.FaceDetails.length + " faces deteced.")
                // console.log(`Detected faces for: ${file.name}`)
                // response.FaceDetails.forEach(data => {
                //     let low = data.AgeRange.Low
                //     let high = data.AgeRange.High
                //     console.log(`The detected face is between: ${low} and ${high} years old`)
                //     console.log("All other attributes:")
                //     console.log(`  BoundingBox.Width:      ${data.BoundingBox.Width}`)
                //     console.log(`  BoundingBox.Height:     ${data.BoundingBox.Height}`)
                //     console.log(`  BoundingBox.Left:       ${data.BoundingBox.Left}`)
                //     console.log(`  BoundingBox.Top:        ${data.BoundingBox.Top}`)
                //     console.log(`  Age.Range.Low:          ${data.AgeRange.Low}`)
                //     console.log(`  Age.Range.High:         ${data.AgeRange.High}`)
                //     console.log(`  Smile.Value:            ${data.Smile.Value}`)
                //     console.log(`  Smile.Confidence:       ${data.Smile.Confidence}`)
                //     console.log(`  Eyeglasses.Value:       ${data.Eyeglasses.Value}`)
                //     console.log(`  Eyeglasses.Confidence:  ${data.Eyeglasses.Confidence}`)
                //     console.log(`  Sunglasses.Value:       ${data.Sunglasses.Value}`)
                //     console.log(`  Sunglasses.Confidence:  ${data.Sunglasses.Confidence}`)
                //     console.log(`  Gender.Value:           ${data.Gender.Value}`)
                //     console.log(`  Gender.Confidence:      ${data.Gender.Confidence}`)
                //     console.log(`  Beard.Value:            ${data.Beard.Value}`)
                //     console.log(`  Beard.Confidence:       ${data.Beard.Confidence}`)
                //     console.log(`  Mustache.Value:         ${data.Mustache.Value}`)
                //     console.log(`  Mustache.Confidence:    ${data.Mustache.Confidence}`)
                //     console.log(`  EyesOpen.Value:         ${data.EyesOpen.Value}`)
                //     console.log(`  EyesOpen.Confidence:    ${data.EyesOpen.Confidence}`)
                //     console.log(`  MouthOpen.Value:        ${data.MouthOpen.Value}`)
                //     console.log(`  MouthOpen.Confidence:   ${data.MouthOpen.Confidence}`)
                //     console.log(`  Emotions[0].Type:       ${data.Emotions[0].Type}`)
                //     console.log(`  Emotions[0].Confidence: ${data.Emotions[0].Confidence}`)
                //     console.log(`  Landmarks[0].Type:      ${data.Landmarks[0].Type}`)
                //     console.log(`  Landmarks[0].X:         ${data.Landmarks[0].X}`)
                //     console.log(`  Landmarks[0].Y:         ${data.Landmarks[0].Y}`)
                //     console.log(`  Pose.Roll:              ${data.Pose.Roll}`)
                //     console.log(`  Pose.Yaw:               ${data.Pose.Yaw}`)
                //     console.log(`  Pose.Pitch:             ${data.Pose.Pitch}`)
                //     console.log(`  Quality.Brightness:     ${data.Quality.Brightness}`)
                //     console.log(`  Quality.Sharpness:      ${data.Quality.Sharpness}`)
                //     console.log(`  Confidence:             ${data.Confidence}`)
                //     console.log("------------")
                //     console.log("")
                // }) // for response.faceDetails
            } // if
        });
    }


    return <div>
        <div>Native SDK File Upload</div>
        <input type="file" onChange={handleFileInput} />
        <button onClick={() => uploadFile(selectedFile)}> Upload to S3</button>
    </div>
}

export default UploadImageToS3WithNativeSdk;