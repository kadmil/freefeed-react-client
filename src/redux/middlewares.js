import {unauthenticated, serverError, request, response, fail, SIGN_IN,
        UNAUTHENTICATED, WHO_AM_I, whoAmI, requiresAuth,
        SHOW_MORE_LIKES, showMoreLikesSync, showMoreLikesAsync} from './action-creators'

//middleware for api requests
export const apiMiddleware = store => next => async (action) => {
  //ignore normal actions
  if (!action.apiRequest){
    return next(action)
  }

  //dispatch request begin action
  //clean apiRequest to not get caught by this middleware
  var t = store.dispatch({...action, type: request(action.type), apiRequest: null})
  try {
    const apiResponse = await action.apiRequest(action.payload)
    const obj = await apiResponse.json()
    if (apiResponse.status === 200) {
      return store.dispatch({payload: obj, type: response(action.type), request: action.payload})
    } else if (apiResponse.status === 401) {
      return store.dispatch(unauthenticated(obj))
    } else {
      return store.dispatch({payload: obj, type: fail(action.type), request: action.payload})
    }
  } catch (e) {
    return store.dispatch(serverError(e))
  }
}

import {setToken, persistUser} from '../services/auth'
import {userParser} from '../utils'
import {pushState} from 'redux-router'

export const authMiddleware = store => next => action => {

  //stop action propagation if it should be authed and user is not authed
  if (requiresAuth(action) && !store.getState().authenticated) {
    return
  }

  switch(action.type){
    case UNAUTHENTICATED: {
      setToken()
      persistUser()
      next(action)
      return store.dispatch(pushState(null, '/login', {}))
    }
    case response(SIGN_IN): {
      setToken(action.payload.authToken)
      next(action)

      //to throw it through all middlewares — apiMiddleware included
      store.dispatch(whoAmI())
      return store.dispatch(pushState(null, '/', {}))
    }
    case response(WHO_AM_I): {
      persistUser(userParser(action.payload.users))
      break
    }
  }

  return next(action)
}

export const likesLogicMiddleware = store => next => action => {
  switch(action.type){
    case SHOW_MORE_LIKES: {
      const postId = action.payload.postId
      const post = store.getState().posts[postId]
      const isSync = (post.omittedLikes === 0)
      if (isSync) {
        return store.dispatch(showMoreLikesSync(postId))
      } else {
        return store.dispatch(showMoreLikesAsync(postId))
      }
    }
  }

  return next(action)
}