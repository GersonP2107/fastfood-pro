const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const businessmanId = '702496d2-77da-444f-b97c-1a4ccd09969d';
const bucketName = 'products';

// Env vars (hardcoded for execution context, do not commit)
const supabaseUrl = 'https://dvsfxqypbgutpfmpyjcc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2c2Z4cXlwYmd1dHBmbXB5amNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY0MTM4MywiZXhwIjoyMDgwMjE3MzgzfQ.LjvsaQZ4zbBFrulNx7q7JmYQD4Vt3x64wdDpWRoGzNM';

const supabase = createClient(supabaseUrl, supabaseKey);

const imagesToProcess = [
    {
        productId: '4be8b7db-8550-49ae-9e6a-d1f3850adf8e',
        filePath: 'C:/Users/ASUS/.gemini/antigravity/brain/af571f9e-d53b-41ee-bf3e-7b344353cff1/hamburguesa_pollo_1770146492525.png',
        fileName: 'hamburguesa_pollo.png'
    },
    {
        productId: '2fc37f15-c21e-42f4-a7b4-d57afdc6ef11',
        filePath: 'C:/Users/ASUS/.gemini/antigravity/brain/af571f9e-d53b-41ee-bf3e-7b344353cff1/alitas_picantes_1770146506355.png',
        fileName: 'alitas_picantes.png'
    },
    {
        productId: '3fa394f3-3b2b-4f07-aa08-bd391f0e07eb',
        filePath: 'C:/Users/ASUS/.gemini/antigravity/brain/af571f9e-d53b-41ee-bf3e-7b344353cff1/aros_cebolla_1770146518990.png',
        fileName: 'aros_cebolla.png'
    },
    {
        productId: '5c90ab6a-5c08-446a-a54a-ee2725709a41',
        filePath: 'C:/Users/ASUS/.gemini/antigravity/brain/af571f9e-d53b-41ee-bf3e-7b344353cff1/limonada_1770146534024.png',
        fileName: 'limonada.png'
    },
    {
        productId: 'e41fe141-0269-4f78-8da9-3b99b9aeba4b',
        filePath: 'C:/Users/ASUS/.gemini/antigravity/brain/af571f9e-d53b-41ee-bf3e-7b344353cff1/yucas_1770146548804.png',
        fileName: 'yucas.png'
    }
];

async function uploadImages() {
    console.log('Starting upload...');

    for (const item of imagesToProcess) {
        try {
            console.log(`Processing ${item.fileName}...`);

            if (!fs.existsSync(item.filePath)) {
                console.error(`File not found: ${item.filePath}`);
                continue;
            }

            const fileBuffer = fs.readFileSync(item.filePath);
            const storagePath = `${businessmanId}/${item.fileName}`; // e.g. business_id/filename.png

            // Upload to Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(storagePath, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) {
                console.error(`Error uploading ${item.fileName}:`, uploadError);
                continue;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(storagePath);

            console.log(`Uploaded to ${publicUrl}`);

            // Update Database
            const { error: dbError } = await supabase
                .from('products')
                .update({ image_url: publicUrl })
                .eq('id', item.productId);

            if (dbError) {
                console.error(`Error updating DB for ${item.productId}:`, dbError);
            } else {
                console.log(`Updated product ${item.productId} with image URL.`);
            }

        } catch (err) {
            console.error(`Unexpected error for ${item.fileName}:`, err);
        }
    }

    console.log('Done.');
}

uploadImages();
