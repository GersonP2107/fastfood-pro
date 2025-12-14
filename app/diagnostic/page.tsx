'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DiagnosticPage() {
    const [results, setResults] = useState<any>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function runDiagnostics() {
            const supabase = createClient()
            const diagnostics: any = {}

            try {
                // Test 1: Check Supabase client creation
                diagnostics.clientCreated = !!supabase
                diagnostics.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'
                diagnostics.hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

                // Test 2: Try to fetch businessmans
                try {
                    const { data: businessData, error: businessError } = await supabase
                        .from('businessmans')
                        .select('id, business_name, slug')
                        .limit(1)

                    diagnostics.businessmans = {
                        success: !businessError,
                        error: businessError?.message || null,
                        data: businessData,
                        count: businessData?.length || 0
                    }
                } catch (err: any) {
                    diagnostics.businessmans = {
                        success: false,
                        error: err.message,
                        data: null
                    }
                }

                // Test 3: Try to fetch categories
                try {
                    const { data: catData, error: catError } = await supabase
                        .from('categories')
                        .select('*')
                        .limit(5)

                    diagnostics.categories = {
                        success: !catError,
                        error: catError?.message || null,
                        data: catData,
                        count: catData?.length || 0
                    }
                } catch (err: any) {
                    diagnostics.categories = {
                        success: false,
                        error: err.message,
                        data: null
                    }
                }

                // Test 4: Try to fetch products
                try {
                    const { data: prodData, error: prodError } = await supabase
                        .from('products')
                        .select('*')
                        .limit(5)

                    diagnostics.products = {
                        success: !prodError,
                        error: prodError?.message || null,
                        data: prodData,
                        count: prodData?.length || 0
                    }
                } catch (err: any) {
                    diagnostics.products = {
                        success: false,
                        error: err.message,
                        data: null
                    }
                }

            } catch (err: any) {
                diagnostics.generalError = err.message
            }

            setResults(diagnostics)
            setLoading(false)
        }

        runDiagnostics()
    }, [])

    if (loading) {
        return <div className="p-8">Running diagnostics...</div>
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Supabase Diagnostics</h1>

            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="font-bold mb-2">Configuration</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify({
                            clientCreated: results.clientCreated,
                            supabaseUrl: results.supabaseUrl,
                            hasAnonKey: results.hasAnonKey
                        }, null, 2)}
                    </pre>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="font-bold mb-2">Businessmans Table</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(results.businessmans, null, 2)}
                    </pre>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="font-bold mb-2">Categories Table</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(results.categories, null, 2)}
                    </pre>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="font-bold mb-2">Products Table</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(results.products, null, 2)}
                    </pre>
                </div>

                {results.generalError && (
                    <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                        <h2 className="font-bold mb-2 text-red-800 dark:text-red-200">General Error</h2>
                        <p className="text-sm">{results.generalError}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
