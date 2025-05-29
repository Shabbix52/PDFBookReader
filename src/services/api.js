import axios from "axios";

export const BASE_URL = "https://backend.mapyourfreedom.com/"

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 30000
})

export const login = async (creds) => {

    try{
        const res = await apiClient.post("/auth/jwt/create/", creds)
        if (res.status === 200){
            localStorage.setItem("myfAccessToken", `JWT ${ res.data.access }`)
            return `JWT ${ res.data.access }`;
        }
        
        return null
    }catch(error){
        console.log(error)
        return null
    } 
}

export const register = async (data) => {

    try{
        const res = await apiClient.post("/auth/users/", data)
        
        if (res.status === 200 || res.status == 201){
            return true
        } 
    
        return false
    }catch(error){
        console.log(error)
        return false
    }
}

export const getUser = async (authToken) =>{
    try{
        const res = await apiClient.get("/auth/users/me/", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            }
        })        
        return res.data

    }catch(error){
        console.log(error)
        return null
    }
}

export const checkout = async (authToken, book_id) =>{
    try{
        const res = await apiClient.post('checkout/', {
            "book_id": book_id 
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": authToken
            }
        })
        if (res.status === 200){
            return res.data.detail
        }
        
        return null
    }catch(error){
        console.log(error)
        return null
    }
}

export const fetchBook = async (authToken, book_id) =>{
    try{
        const res = await apiClient.get(`books/${book_id}/get_book/`, {
            headers: {
                "Content-Type": "application/pdf",
                'Authorization': authToken
            },
            responseType: 'blob'
        })

        if (res.status === 200){
            if (!(res.data instanceof Blob)) {
                throw new Error('Response is not a Blob');
            }
            return res.data
        }else{
            return null
        }
    }catch(error){
        console.log(error)
        return null
    }
}

export const fetchAllBooks = async (authToken) =>{
    try{
        const res = await apiClient.get('books/', {
            headers: {
                "Content-Type": "application/pdf",
                'Authorization': authToken
            }
        })

        if (res.status === 200){
            return res.data
        }else{    
            return null
        }
    }catch(error){
        console.log(error)
        return null 
    }
}     






