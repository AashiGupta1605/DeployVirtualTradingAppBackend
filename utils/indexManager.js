
export const initializeCollectionIndexes = async (collection, indexName, indexSpec) => {
  try {
    // Get list of existing indexes
    const indexCursor = await collection.listIndexes();
    const indexes = await indexCursor.toArray();
    
    // Check if our index already exists
    const existingIndex = indexes.find(index => index.name === indexName);
    
    if (existingIndex) {
      console.log(`✅ Index ${indexName} already exists for ${collection.collectionName}`);
      return;
    }

    // Drop any conflicting indexes
    for (const index of indexes) {
      if (index.name !== '_id_' && 
          JSON.stringify(index.key) === JSON.stringify(indexSpec.fields)) {
        await collection.dropIndex(index.name);
        console.log(`Dropped conflicting index: ${index.name}`);
      }
    }

    // Create new index
    await collection.createIndex(
      indexSpec.fields,
      {
        ...indexSpec.options,
        name: indexName
      }
    );

    console.log(`✅ Index ${indexName} created for ${collection.collectionName}`);
  } catch (error) {
    if (error.code === 85) { // Index already exists with different name
      console.log(`⚠️ Index already exists with different name for ${collection.collectionName}`);
    } else {
      console.error(`❌ Error managing indexes for ${collection.collectionName}:`, error);
    }
  }
};