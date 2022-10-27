// We create a custom hook
// For fetching the gif using keyword
// require('dotenv').config();
import { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_GIF_API_KEY;

const useFetch = ({keyword}) => {
    const [gifUrl, setGifUrl] = useState('');

    const fetchGifs = async () => {
        try {
            // .split takes the string and divides it into an array of substrings and returns this array
            // .join joins all elements of an array into a string and limit=1 implies search only one gif
            // fetch is used to load the APIs that is used to return data here gifs, using search endpoints
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${keyword.split(" ").join("")}&limit=1`);

            // destructure response and get the data out of it
            const { data } = await response.json();
            // ?. is optional chaining, it is used to check if the data exists or not
            // Here we check the series of data and get the url of the gif
            // the data should be data[0]: { images: {downsized_medium: {url: "https://giphy.com/gifs/..."}}}
            setGifUrl(data[0]?.images?.downsized_medium.url);
        } catch(error) {
            // set random gif
            setGifUrl('https://media4.popsugar-assets.com/files/2013/11/07/832/n/1922398/eb7a69a76543358d_28.gif');
        }
    }

    // useEffect is used to run the fetchGifs function only when the keyword changes
    // So for every new keyword, the useEffect will run and fetch the gif
    useEffect(() => {
      if(keyword)  fetchGifs();
    },[keyword]);

    // return the gifUrl to be used in the component
    return gifUrl;
}

export default useFetch;