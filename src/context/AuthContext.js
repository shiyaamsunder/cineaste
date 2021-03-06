import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, provider } from '../firebase'


export const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [onhomepage, setOnHomePage] = useState(true)
    const [emailError, setEmailError] = useState()
    const [passwordError, setPasswordError] = useState('')


    const clearErrors = () => {
        setPasswordError('')
        setEmailError('')
    }
    const signUp = (email, password, redirect, name) => {
        clearErrors()
        auth.createUserWithEmailAndPassword(email, password).then(u => {
            db.collection('users').doc(name).set({
                name: name,
                bucket: []
            })
            redirect()
        })
            .catch(err => {
                switch (err.code) {
                    case 'auth/weak-password':
                        setPasswordError(err.message)
                        break;
                    case 'auth/email-already-in-use':
                    case 'auth/invalid-email':
                        setEmailError(err.message)
                        break;
                    default:
                        break;
                }

            })

    }

    async function login(email, password, redirect) {
        clearErrors()
        return auth.signInWithEmailAndPassword(email, password).then(u => {
            redirect()
        }).catch(err => {
            switch (err.code) {
                case 'auth/invaild-email':
                    setEmailError('Invalid-email')
                    break;
                case 'auth/user-not-found':
                    setEmailError('User not found')
                    break;
                case 'auth/user-disabled':
                    setEmailError('User disabled')

                    break
                case 'auth/wrong-password':
                    setPasswordError('Invalid Password')
                    break
                default:
                    break
            }
        })
    }

    const googleSignUp = async (redirect) => {
        const snapshot = await db.collection('users').get()
        const docIds = snapshot.docs.map(doc => doc.id)

        auth.signInWithPopup(provider).then(u => {
            if (docIds.filter(id => (u.user.displayName === id)).length < 1) {
                db.collection('users').doc(u.user.displayName).set({
                    name: u.user.displayName,
                    bucket: []
                })
            }

            redirect()
        })

    }

    function setUserName(name) {

        auth.onAuthStateChanged(user => {
            if (user) {
                user.updateProfile({
                    displayName: name
                })


            } else {
                console.log('No User')
            }

        })

    }

    function logout() {
        return auth.signOut()
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe

    }, [])



    const value = {
        currentUser,
        setCurrentUser,
        signUp,
        googleSignUp,
        login,
        logout,
        setUserName,
        name,
        setName,
        passwordError,
        emailError,
        onhomepage, setOnHomePage

    }
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>)
}


