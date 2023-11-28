// import axios from 'axios';

// import { Api_Notifications, Service_URLS } from '../constants/config.js';

// const Api_URL = 'http://localhost:3000';
// const axiosInstance = axios.create({
//     baseURL: Api_URL,
//     timeout: 10000,
//     headers: {
//         "Content-Type": "application/json",
//     }
// });

// axiosInstance.interceptors.request.use(
//     function (config) {
//         return config;
//     },
//     function (error) {
//         return Promise.reject(error);
//     }
// );

// axiosInstance.interceptors.response.use(
//     function (response) {
//         return ProcessResponse(response);
//     },
//     function (error) {
//         return Promise.reject(processError(error));
//     }
// );

// const ProcessResponse = (response) => {
//     if (response.status === 200) {
//         return { isSuccess: true, data: response.data };
//     } else {
//         return {
//             isFailure: true,
//             status: response.status,
//             msg: response.data.msg || 'Unknown error occurred', // Adjust this to match your response structure
//             code: response.status,
//         };
//     }
// };
// const processError = (error) => {
//     if (error.response) {
//         const errorMessage = Api_Notifications.ResponseFailure.message; // Access the error message from notifications

//         return {
//             isError: true,
//             msg: errorMessage,
//             code: error.response.status,
//         };
//     } else if (error.request) {
//         const errorMessage = Api_Notifications.RequestFailure.message; // Access the error message from notifications

//         return {
//             isError: true,
//             msg: errorMessage,
//             code: "",
//         };
//     } else {
//         const errorMessage = Api_Notifications.network.message; // Access the error message from notifications

//         return {
//             isError: true,
//             msg: errorMessage,
//             code: "",
//         };
//     }
// };


// const API = {};
// for (const [key, value] of Object.entries(Service_URLS)) {
//     API[key] = (body, showUploadProgress, showDownloadProgress) =>
//         axiosInstance({
//             url: value.url, // 'url' should be lowercase
//             method: value.method,
//             data: body,
//             responseType: value.responseType,
//             onUploadProgress: function (progressEvent) {
//                 if (showUploadProgress) {
//                     let complete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                     showUploadProgress(complete);
//                 }
//             },
//             onDownloadProgress: function (progressEvent) {
//                 if (showDownloadProgress) {
//                     let complete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                     showDownloadProgress(complete);
//                 }
//             }
//         });
// }

// export { API };
