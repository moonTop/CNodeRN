'use strict'

import React,{Component,PropTypes} from "react-native"
import Navigation from "./navigation"
import {combineReducers,bindActionCreators} from "redux"
import containerByComponent from "../../lib/redux-helper"
import routerReducer from "./reducer"
import * as actions from "./action"
import Immutable from "seamless-immutable"

class Router extends Component{
    static propTypes = {
        initialSceneKey:PropTypes.string
    }
    constructor(props){
        super(props)
        this._scenes = this._scenesListByChilren(props.children)
    }
    _scenesListByChilren(chilren){
        const _scenes = React.Children.map(chilren,(child)=>{
            let nextChildren = null
            if(child.props.children){
                nextChildren = this._scenesListByChilren(child.props.children)
                return {key:child.key,...child.props,children:nextChildren}
            }else{
                return {key:child.key,...child.props}
            }
        })
        return Immutable(_scenes)
    }
    render(){
        if(!this.props.initialSceneKey){
            throw new Error("missing initialSceneKey")
        }
        const initialState = {
            navigationState:initialStateFromScenes(this._scenes,this.props.initialSceneKey),
            scenes:this._scenes
        }
        const RouterContainer = containerByComponent(Navigation,routerReducer,dispatch=>({
            navigationActions:bindActionCreators(actions,dispatch)
        }),initialState)
        return <RouterContainer/>
    }
}

export class Scene extends Component{
    static propTypes = {
        tabbar:PropTypes.bool,
        component:PropTypes.element,
        key:PropTypes.string
    }
    render(){
        return null
    }
}

function initialStateFromScenes(scenes,initialSceneKey){
    let state = Immutable({
        index:0,
        key:"root",
        children:[]
    })
    let initialSceneIndex = scenes.findIndex(scene=>scene.key === initialSceneKey)
    initialSceneIndex = initialSceneIndex > -1?initialSceneIndex:0
    let initialScene = scenes[initialSceneIndex]
    if(initialScene.tabbar){
        initialScene = initialScene.set("children",initialScene.children.map((item,i)=>{
            return {
                index:0,
                ...item,
                children:[item.children[0]]
            }
        }))
    }
    state = state.setIn(["children",0],initialScene)
    return state
}

export default Router