import { supabase } from "@/integrations/supabase/client";

export const insertDummyProspects = async (userId: number) => {
  const dummyProspects = [
    {
      business_name: "Tech Solutions Inc",
      notes: "Interested in our services",
      website: "www.techsolutions.com",
      email: "contact@techsolutions.com",
      business_address: "123 Tech Street, Silicon Valley, CA",
      phone_number: "555-0123",
      owner_name: "John Smith",
      status: "New",
      priority: "High",
      owner_phone: "555-0124",
      owner_email: "john@techsolutions.com",
      user_id: userId,
      last_contact: new Date().toISOString()
    },
    {
      business_name: "Digital Marketing Pro",
      notes: "Follow up needed",
      website: "www.digitalmarketingpro.com",
      email: "info@digitalmarketingpro.com",
      business_address: "456 Marketing Ave, New York, NY",
      phone_number: "555-0125",
      owner_name: "Sarah Johnson",
      status: "In Progress",
      priority: "Medium",
      owner_phone: "555-0126",
      owner_email: "sarah@digitalmarketingpro.com",
      user_id: userId,
      last_contact: new Date().toISOString()
    }
  ];

  try {
    const { data, error } = await supabase
      .from('prospects')
      .insert(dummyProspects)
      .select();

    if (error) throw error;
    console.log("Successfully added dummy prospects:", data);
    return data;
  } catch (error) {
    console.error("Error adding dummy prospects:", error);
    throw error;
  }
};