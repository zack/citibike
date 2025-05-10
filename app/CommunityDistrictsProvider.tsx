  children,
}: {
  communityDistricts: CommunityDistrict[];
  children: React.ReactNode;
}) {
  return (
    <CommunityDistrictsContext.Provider value={communityDistricts}>
      {children}
    </CommunityDistrictsContext.Provider>
  );
}
