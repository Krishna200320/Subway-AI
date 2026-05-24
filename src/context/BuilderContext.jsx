import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastContext'

const BuilderContext = createContext(null)

const ITEM_MAP    = { footlong: 'Footlong', sixinch: '6-inch', wrap: 'Wrap', bowl: 'Bowl' }
const BREAD_MAP   = { wheat: '9-Grain Wheat', italian: 'Italian White', multigrain: 'Hearty Multigrain', flatbread: 'Flatbread', sourdough: 'Sourdough' }
const PROTEIN_MAP = { bmt: 'Italian BMT', chicken: 'Rotisserie Chicken', steak: 'Steak & Cheese', tuna: 'Tuna', turkey: 'Turkey Breast', meatball: 'Meatball Marinara', veggie: 'Veggie Delite' }
const CHEESE_MAP  = { none: 'No Cheese', american: 'American', cheddar: 'Cheddar', provolone: 'Provolone', swiss: 'Swiss', pepperjack: 'Pepperjack' }

function resolveKey(map, value) {
  if (!value) return value
  if (Object.values(map).includes(value)) return value
  return map[value] || value
}

const DEFAULT_STATE = {
  item: null, bread: null, protein: null, cheese: null,
  veggies: [], sauces: [], toasted: false, mealDeal: null,
  aiPrefilled: false,
}

export function BuilderProvider({ children }) {
  const [state, setState]           = useState({ ...DEFAULT_STATE })
  const reviewNudgeCacheRef         = useRef(null)
  const navigate                    = useNavigate()
  const { showToast }               = useToast()

  const prefillBuilder = useCallback((selections) => {
    setState(prev => {
      const next = { ...prev, aiPrefilled: true }
      if (selections.item    !== undefined) next.item    = resolveKey(ITEM_MAP, selections.item)
      if (selections.bread   !== undefined) next.bread   = resolveKey(BREAD_MAP, selections.bread)
      if (selections.protein !== undefined) next.protein = resolveKey(PROTEIN_MAP, selections.protein)
      if (selections.cheese  !== undefined) next.cheese  = resolveKey(CHEESE_MAP, selections.cheese)
      if (selections.veggies !== undefined) next.veggies = Array.isArray(selections.veggies) ? selections.veggies : []
      if (selections.sauces  !== undefined) next.sauces  = Array.isArray(selections.sauces) ? selections.sauces : []
      if (selections.toasted !== undefined) next.toasted = Boolean(selections.toasted)
      if (selections.mealDeal !== undefined) next.mealDeal = selections.mealDeal
      return next
    })
    navigate('/build')
    setTimeout(() => showToast('SubAI pre-filled your order — review and confirm!'), 300)
  }, [navigate, showToast])

  const resetBuilder = useCallback(() => {
    setState({ ...DEFAULT_STATE })
    reviewNudgeCacheRef.current = null
  }, [])

  const updateBuilder = useCallback((field, value) => {
    setState(prev => ({ ...prev, [field]: value }))
  }, [])

  const dismissAIPrefill = useCallback(() => {
    setState(prev => ({ ...prev, aiPrefilled: false }))
  }, [])

  const getCurrentBuild = useCallback(() => {
    const { item, bread, protein, cheese, veggies, sauces, toasted, mealDeal } = state
    const parts = []
    if (item)                             parts.push(`Item: ${item}`)
    if (bread)                            parts.push(`Bread: ${bread}`)
    if (protein)                          parts.push(`Protein: ${protein}`)
    if (cheese && cheese !== 'No Cheese') parts.push(`Cheese: ${cheese}`)
    if (veggies?.length)                  parts.push(`Veggies: ${veggies.join(', ')}`)
    if (sauces?.length)                   parts.push(`Sauces: ${sauces.join(', ')}`)
    if (toasted)                          parts.push('Toasted: yes')
    if (mealDeal)                         parts.push(`Meal: ${mealDeal}`)
    return parts.length ? parts.join(' | ') : 'No selections yet'
  }, [state])

  return (
    <BuilderContext.Provider value={{
      ...state,
      prefillBuilder,
      resetBuilder,
      updateBuilder,
      dismissAIPrefill,
      getCurrentBuild,
      reviewNudgeCache: reviewNudgeCacheRef,
    }}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider')
  return ctx
}
