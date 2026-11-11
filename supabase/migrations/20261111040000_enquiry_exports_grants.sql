-- service_role needs table privileges for the SECURITY INVOKER export-log functions.
grant select, insert on registration_private.enquiry_exports to service_role;
