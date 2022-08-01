import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {socketIOClient, socket, ENDPOINT} from "../ClientSocket";


export default function Form(props){

    const navigate = useNavigate();    
    const usernameInput = useRef(null);
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordLengthIsValid, setPasswordLengthIsValid] = useState(false);
    const [invalidUsername, setInvalidUsername] = useState(false);
    const [afterFirstRender, setAfterFirstRender] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState('');
    const [usernameReserved, setUsernameReserved] = useState(false);
    const [unableToFindAccount, setUnableToFindAccount] = useState(false);

    useEffect(()=>{
        if (props.type === 'Log In') return ;
        const checkPasswordLength = setInterval(()=>{
            if (password.length >= 8) setPasswordLengthIsValid(true);
        }, 200);
        username !== '' ? setInvalidUsername(false) : setInvalidUsername(true);
        if (invalidUsername){
            if (afterFirstRender) usernameInput.current.style = 'border-bottom-color:red;'
            return;
        } 
        usernameInput.current.style = 'border-bottom-color:white;'        
    });    

    useEffect(() => {
        props.setIsLoggedIn(true);
        document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
        usernameInput.current.style = 'border-bottom-color:white;'        
    }, []); 



    const retrieveHttpResponse = async (API) => {

        let authUser = false;
        const requestMethod = props.type === 'Sign Up' ? 'POST' : 'PUT';

        const requestDetail = {
            mode: 'cors',
            headers : {
                'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin':'*'                
            },
            method : requestMethod,
            body : JSON.stringify({username, password})
        }
        fetch(API, requestDetail)
            .then(
                (res) => res.json()
            )
            .then(
                async res => {
                    if (res.status === 'success') {authUser = true}
                    if (props.type === 'Log In' && res.message === 'user is online!'){
                        setUserLoggedIn(true);
                    } else if (props.type === 'Log In' && res.status === 'fail'){
                        setUnableToFindAccount(true);
                    }
                    else setUserLoggedIn(false);
                    if (props.type === 'Sign Up') authUser = true;
                    if (res.message === 'username is occupied!' && props.type === 'Sign Up') {
                        setUsernameReserved(true);
                        authUser = false;                    
                    }
                    return {authUser, res};
                }
            )
            .then(
                (config) => {
                    if (config.authUser) {
                        props.setIsLoggedIn(true);
                        navigate('/app', {state: config.res});
                    }
                    return;
                }
            )
            .catch((err) => {});
    }


    const validatePassword = (e) => {
        props.setIsLoggedIn(true);       
        e.preventDefault();
        if (username === '') setInvalidUsername(true);
        if (!passwordLengthIsValid || username === '') {
            return;
        }   
        retrieveHttpResponse(e.target.action);

    }

    const findUser = (e) => {
        props.setIsLoggedIn(true);
        e.preventDefault();
        retrieveHttpResponse(e.target.action);
    }

    const checkUsername = (e) => {
        setAfterFirstRender(true);
        setUsername(e.target.value);
    }    
    
    const checkPassword = (e) => {
        setPassword(e.target.value);
        if (props.type === 'Sign Up') setPasswordLengthIsValid(() => password.length >= 8 ? true : false);
    }

    return (
        <div className="prelogin-wrapper">
            <h1 className="title">{props.type}</h1>
            <form action={props.targetAPI} method={props.type === 'Sign Up' ? 'POST' : 'PUT'} onSubmit={props.type === 'Sign Up' ? validatePassword : findUser}>
                <input ref={usernameInput} type="text" name="username" placeholder="Enter username" value={username} onChange={checkUsername}/>
                <input type="password" name="password" placeholder="Enter password" value={password} onChange={checkPassword}/>                
                <button type="submit">{props.type}</button>
            </form>
            <h1 className="error-message">{
                (props.type === 'Sign Up' ? (!passwordLengthIsValid ? "Password length must be longer than 8 character." :
                 (usernameReserved ? "Username is occupied." : null)) :
                (props.type === 'Log In' && userLoggedIn ? "User is currently online!" : (unableToFindAccount ? 'Incorrect username / password' : null)))
             }</h1>
            <h1 class="copyright">Copyright 2022 &copy; IngenHouzs</h1>            
        </div>
        
    );

}