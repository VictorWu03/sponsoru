import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Try to query the social_accounts table structure
    const { data: tableInfo, error: schemaError } = await supabase
      .from('social_accounts')
      .select('*')
      .limit(1);

    // Try to get table columns info (this might not work with RLS)
    const { data: existingAccounts, error: queryError } = await supabase
      .from('social_accounts')
      .select('user_id, platform, created_at')
      .limit(3);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database_check: {
        table_exists: !schemaError,
        schema_error: schemaError ? {
          message: schemaError.message,
          code: schemaError.code,
          details: schemaError.details
        } : null,
        query_error: queryError ? {
          message: queryError.message,
          code: queryError.code,
          details: queryError.details
        } : null,
        sample_data: existingAccounts,
        table_accessible: !queryError
      },
      recommendations: [
        schemaError ? 'Create social_accounts table' : 'Table exists',
        queryError ? 'Check RLS policies' : 'Table accessible',
        'Verify column names match the upsert data'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Failed to check database schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 